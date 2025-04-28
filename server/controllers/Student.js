const User = require("../models/User");
const AllocatedCourse = require("../models/AllocatedCourse");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

// Get all unenrolled courses for a student
exports.getUnEnrolledCourses = async (req, res) => {
    console.log("getUnEnrolledCourses controller called");
	try {
		const studentId = req.user.id;

		// Find all allocated courses for the student that are not yet enrolled
		const unenrolledCourses = await AllocatedCourse.find({
			student: studentId,
			isEnrolled: false
		})
			.populate('course')
			.populate({
                path: 'instructor',
                select: 'firstName lastName email image department',
                populate: {
                    path: 'department',
                    select: 'name code'
                }
            })
			.populate('department')
			.sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			message: "Unenrolled courses fetched successfully",
			data: unenrolledCourses,
		});
	} catch (error) {
		console.error("Error in getUnEnrolledCourses controller: ", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};



// Get all enrolled courses for the student
exports.getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Find all course allocations where the student is enrolled
        const enrolledCourses = await AllocatedCourse.find({ 
            student: studentId,
            isEnrolled: true // Only get courses where student is enrolled
        })
        .populate({
            path: 'course',
            select: 'courseName courseCode courseDescription thumbnail status approved category createdAt totalVideos',
            populate: {
                path: 'category',
                select: 'name'
            }
        })
        .populate({
            path: 'instructor',
            select: 'firstName lastName email image department',
            populate: {
                path: 'department',
                select: 'name code'
            }
        })
        .populate({
            path: 'department',
            select: 'name code'
        })
        .populate({
            path: 'completedLectures',
            select: 'completedVideos watchedLectures lastAccessed'
        })
        .populate({
            path: 'ratingAndReview',
            select: 'rating review'
        })
        .sort({ enrollmentDate: -1 }) // Sort by enrollment date
        .lean();

        if (!enrolledCourses || enrolledCourses.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No enrolled courses found",
                data: {
                    totalCourses: 0,
                    activeCourses: 0,
                    expiredCourses: 0,
                    courses: []
                }
            });
        }

        // Format the response
        const formattedCourses = enrolledCourses.map(enrollment => {
            // Check if course is expired
            const isExpired = enrollment.validityEndDate && new Date(enrollment.validityEndDate) < new Date();
            const status = isExpired ? "Expired" : enrollment.status;

            return {
                courseId: enrollment.course._id,
                courseName: enrollment.course.courseName,
                courseCode: enrollment.course.courseCode,
                courseDescription: enrollment.course.courseDescription,
                thumbnail: enrollment.course.thumbnail,
                status: status,
                approved: enrollment.course.approved,
                category: enrollment.course.category?.name || "No Category",
                instructor: {
                    id: enrollment.instructor._id,
                    name: `${enrollment.instructor.firstName} ${enrollment.instructor.lastName}`,
                    email: enrollment.instructor.email,
                    image: enrollment.instructor.image,
                    department: enrollment.instructor.department ? {
                        name: enrollment.instructor.department.name,
                        code: enrollment.instructor.department.code
                    } : null
                },
                department: {
                    name: enrollment.department.name,
                    code: enrollment.department.code
                },
                enrollmentDate: enrollment.enrollmentDate,
                validityEndDate: enrollment.validityEndDate,
                progress: enrollment.completedLectures ? {
                    completedVideos: enrollment.completedLectures.watchedLectures || 0,
                    totalVideos: enrollment.course.totalVideos || 0,
                    percentage: (enrollment.completedLectures.watchedLectures / enrollment.course.totalVideos) * 100 || 0
                } : {
                    completedVideos: 0,
                    totalVideos: 0,
                    percentage: 0
                },
                rating: enrollment.ratingAndReview ? {
                    rating: enrollment.ratingAndReview.rating,
                    review: enrollment.ratingAndReview.review
                } : null,
                lastAccessed: enrollment.completedLectures.lastAccessed,
                createdAt: enrollment.course.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            message: "Enrolled courses fetched successfully",
            data: {
                totalCourses: formattedCourses.length,
                activeCourses: formattedCourses.filter(course => course.status === "Active").length,
                expiredCourses: formattedCourses.filter(course => course.status === "Expired").length,
                courses: formattedCourses
            }
        });

    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrolled courses",
            error: error.message
        });
    }
};

// Enroll student in an allocated course
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user.id;

        // Check if the course is allocated to the student
        const allocatedCourse = await AllocatedCourse.findOne({
            course: courseId,
            student: studentId
        });

        if (!allocatedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not allocated to the student"
            });
        }

        // Check if already enrolled
        if (allocatedCourse.isEnrolled) {
            return res.status(400).json({
                success: false,
                message: "Already enrolled in this course"
            });
        }

        // Get the course to check total videos
        const course = await Course.findById(courseId)
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection'
                }
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Create course progress document
        const courseProgress = await CourseProgress.create({
            courseID: courseId,
            userID: studentId,
            watchedLectures: 0,
        });

        // Update allocated course with enrollment details
        allocatedCourse.isEnrolled = true;
        allocatedCourse.enrollmentDate = new Date();
        allocatedCourse.completedLectures = courseProgress._id;
        await allocatedCourse.save();

        return res.status(200).json({
            success: true,
            message: "Successfully enrolled in the course",
            data: {
                courseId: courseId,
                enrollmentDate: allocatedCourse.enrollmentDate,
            }
        });

    } catch (error) {
        console.error("Error enrolling in course:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to enroll in course",
            error: error.message
        });
    }
};

