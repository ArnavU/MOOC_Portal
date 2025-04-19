const User = require("../models/User");
const Course = require("../models/Course");
const AllocatedCourse = require("../models/AllocatedCourse");
const CourseProgress = require("../models/CourseProgress");


// Get list of students in instructor's department
exports.getDepartmentStudents = async (req, res) => {
    try {
        const instructorId = req.user.id;

        // Get the instructor's department
        const instructor = await User.findById(instructorId).populate('department');
        if (!instructor) {
            console.log("Instructor not found");
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            });
        }

        // Get all students in the department
        const students = await User.find({
            accountType: "Student",
            department: instructor.department._id,
            active: true
        })
        .populate({
            path: 'additionalDetails',
            select: 'prn rollNumber year semester batch contactNumber'
        })
        .populate({
            path: 'department',
            select: 'name code'
        })
        .select('firstName lastName email image');

        // Get all course allocations for these students
        const courseAllocations = await AllocatedCourse.find({
            instructor: instructorId,
            department: instructor.department._id
        })
        .populate({
            path: 'course',
            select: 'courseName courseCode courseDescription status approved thumbnail'
        })
        .populate({
            path: 'student',
            select: 'firstName lastName email image'
        })
        .populate({
            path: 'completedLectures',
            select: 'completedVideos totalVideos completedPercentage'
        })
        .populate({
            path: 'ratingAndReview',
            select: 'rating review'
        });

        // Format the response
        const formattedStudents = students.map(student => {
            // Find all course allocations for this student
            const studentAllocations = courseAllocations.filter(
                allocation => allocation.student._id.toString() === student._id.toString()
            );

            // Format course details
            const courses = studentAllocations.map(allocation => {
                // Check if course is expired
                const isExpired = allocation.validityEndDate && new Date(allocation.validityEndDate) < new Date();
                const status = isExpired ? "Expired" : allocation.status;

                return {
                    courseId: allocation.course._id,
                    courseName: allocation.course.courseName,
                    courseCode: allocation.course.courseCode,
                    thumbnail: allocation.course.thumbnail,
                    status: status,
                    approved: allocation.course.approved,
                    enrollmentStatus: allocation.isEnrolled ? "Enrolled" : "Not Enrolled",
                    enrollmentDate: allocation.enrollmentDate,
                    validityEndDate: allocation.validityEndDate,
                    progress: {
                        percentage: allocation.completedLectures?.completedPercentage || 0,
                        completedVideos: allocation.completedLectures?.completedVideos?.length || 0,
                        totalVideos: allocation.completedLectures?.totalVideos || 0,
                        detailedPercentage: allocation.completedLectures?.completedPercentage || 0
                    },
                    rating: allocation.ratingAndReview ? {
                        rating: allocation.ratingAndReview.rating,
                        review: allocation.ratingAndReview.review
                    } : null,
                    lastAccessed: allocation.lastAccessed,
                    allocatedOn: allocation.createdAt
                };
            });

            return {
                _id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                image: student.image,
                prn: student.additionalDetails.prn,
                rollNumber: student.additionalDetails.rollNumber,
                year: student.additionalDetails.year,
                semester: student.additionalDetails.semester,
                batch: student.additionalDetails.batch,
                contactNumber: student.additionalDetails.contactNumber,
                department: {
                    name: student.department.name,
                    code: student.department.code
                },
                courses: courses,
                totalCourses: courses.length,
                enrolledCourses: courses.filter(course => course.enrollmentStatus === "Enrolled").length,
                activeCourses: courses.filter(course => course.status === "Active").length,
                expiredCourses: courses.filter(course => course.status === "Expired").length
            };
        });

        console.log("Formatted Students:", formattedStudents.length);
        console.log("Students:", formattedStudents);

        return res.status(200).json({
            success: true,
            data: {
                totalStudents: formattedStudents.length,
                students: formattedStudents
            }
        });

    } catch (error) {
        console.error("Error in getDepartmentStudents:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch department students",
            error: error.message
        });
    }
};

  
exports.allocateCourseToStudents = async (req, res) => {
    try {
        const { studentIds, courseId } = req.body;
        const instructorId = req.user.id;

        // Validate input
        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid student IDs"
            });
        }

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid course ID"
            });
        }

        // Check if the course exists and belongs to the instructor
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to assign this course"
            });
        }

        // Check if the course is approved
        if (!course.approved) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign an unapproved course"
            });
        }

        // Get instructor details
        const instructor = await User.findById(instructorId);
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            });
        }

        // Calculate validity end date
        const validityEndDate = new Date();
        validityEndDate.setDate(validityEndDate.getDate() + course.validityDuration);

        // Create course allocations for each student
        const allocationPromises = studentIds.map(async (studentId) => {
            try {
            // Check if student already has this course
            const student = await User.findById(studentId);
            if (!student) {
                    return { 
                        studentId, 
                        success: false, 
                        message: "Student not found",
                        studentDetails: {
                            firstName: "Unknown",
                            lastName: "Student",
                            email: "Not found"
                        }
                    };
                }

                // Check if course is already allocated to the student
                const existingAllocation = await AllocatedCourse.findOne({
                    course: courseId,
                    student: studentId
                });

                if (existingAllocation) {
                    return { 
                        studentId, 
                        success: false, 
                        message: "Course already allocated",
                        studentDetails: {
                            firstName: student.firstName,
                            lastName: student.lastName,
                            email: student.email
                        }
                    };
                }

                // Create new allocation
                const newAllocation = await AllocatedCourse.create({
                    course: courseId,
                    student: studentId,
                    instructor: instructorId,
                    institute: instructor.institute,
                    department: instructor.department,
                    validityEndDate: validityEndDate,
                    status: "Active"
                });

                return { 
                    studentId, 
                    success: true, 
                    allocationId: newAllocation._id,
                    studentDetails: {
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email
                    }
                };
            } catch (error) {
                return { studentId, success: false, message: error.message };
            }
        });

        const results = await Promise.all(allocationPromises);

        // Separate successful and failed allocations
        const successfulAllocations = results.filter(r => r.success);
        const failedAllocations = results.filter(r => !r.success);
        console.log("Successful Allocations:", successfulAllocations);
        console.log("Failed Allocations:", failedAllocations);
        return res.status(200).json({
            success: true,
            message: `Successfully allocated course to ${successfulAllocations.length} students`,
            data: {
                totalAllocated: successfulAllocations.map(alloc => ({
                    studentId: alloc.studentId,
                    ...alloc.studentDetails
                })),
                failedAllocations: failedAllocations.length > 0 ? failedAllocations.map(fail => ({
                    studentId: fail.studentId,
                    ...fail.studentDetails,
                    error: fail.message
                })) : undefined
            }
        });

    } catch (error) {
        console.error("Error allocating course to students:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to allocate course to students",
            error: error.message
        });
    }
};

// Get all allocated courses with student details in same department
exports.getCourseAllocations = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const instructor = await User.findById(instructorId);
        const department = instructor.department;

        // Find all course allocations for the instructor
        const allocatedCourses = await AllocatedCourse.find({ instructor: instructorId, department: department })
            .populate({
                path: 'course',
                select: 'courseName courseCode courseDescription thumbnail status approved category department createdAt',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            })
            .populate({
                path: 'department',
            })
            .populate({
                path: 'student',
                select: 'firstName lastName email additionalDetails department',
                populate: {
                    path: 'additionalDetails department',
                    select: 'prn rollNumber department year semester name'
                },
            })
            .populate({
                path: 'completedLectures',
                select: 'completedVideos totalVideos completedPercentage'
            })
            .populate({
                path: 'ratingAndReview',
                select: 'rating review'
            })
            .sort({ createdAt: -1 })
            .lean();

        if (!allocatedCourses || allocatedCourses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No allocated courses found for this instructor"
            });
        }

        // Group allocations by course
        const coursesMap = new Map();

        allocatedCourses.forEach(allocation => {
            if (!coursesMap.has(allocation.course._id)) {
                coursesMap.set(allocation.course._id, {
                    courseId: allocation.course._id,
                    courseName: allocation.course.courseName,
                    courseCode: allocation.course.courseCode,
                    courseDescription: allocation.course.courseDescription,
                    thumbnail: allocation.course.thumbnail,
                    status: allocation.course.status,
                    approved: allocation.course.approved,
                    category: allocation.course.category,
                    department: allocation.department,
                    createdAt: allocation.course.createdAt,
                    students: []
                });
            }

            const studentData = {
                studentId: allocation.student._id,
                firstName: allocation.student.firstName,
                lastName: allocation.student.lastName,
                email: allocation.student.email,
                prn: allocation.student.additionalDetails?.prn || "Not Available",
                rollNumber: allocation.student.additionalDetails?.rollNumber || "Not Available",
                department: allocation.student.department.name || "Not Available",
                year: allocation.student.additionalDetails?.year || "Not Available",
                semester: allocation.student.additionalDetails?.semester || "Not Available",
                enrollmentStatus: allocation.isEnrolled ? "Enrolled" : "Not Enrolled",
                enrollmentDate: allocation.enrollmentDate,
                validityEndDate: allocation.validityEndDate,
                status: allocation.status,
                progress: allocation.completedLectures ? {
                    completedVideos: allocation.completedLectures.completedVideos?.length || 0,
                    totalVideos: allocation.completedLectures.totalVideos || 0,
                    percentage: allocation.progress || 0
                } : null,
                rating: allocation.ratingAndReview ? {
                    rating: allocation.ratingAndReview.rating,
                    review: allocation.ratingAndReview.review
                } : null,
                lastAccessed: allocation.lastAccessed
            };

            coursesMap.get(allocation.course._id).students.push(studentData);
        });

        // Convert map to array and add total enrolled count
        const formattedCourses = Array.from(coursesMap.values()).map(course => ({
            ...course,
            totalEnrolled: course.students.length
        }));

        return res.status(200).json({
            success: true,
            message: "Successfully fetched allocated courses",
            data: formattedCourses
        });

    } catch (error) {
        console.error("Error in getAllocatedCourses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch allocated courses",
            error: error.message
        });
    }
};
  
  