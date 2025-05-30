/**
 * Course Controllers:
 * 1. createCourse - Creates a new course
 * 2. getAllCourses - Fetches all courses
 * 3. getCourseDetails - Gets detailed information about a specific course
 * 4. getInstructorCourses - Gets all courses of a particular instructor
 * 5. editCourse - Updates course details
 * 6. getFullCourseDetails - Gets complete course details including progress
 * 7. deleteCourse - Deletes a course and its associated data
 * 8. searchCourse - Searches courses by title, description and tags
 * 9. markLectureAsComplete - Marks a lecture as completed for a user
 * 10. getPendingCourses - Gets pending courses for HOD approval
 * 11. approveCourse - Approves a course
 * 12. getAllDepartmentCourses - Gets all courses in the HOD's department with complete details
 * 13. getApprovedInstructorCourses - Gets all approved courses created by the instructor themselves
 */

const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration}= require("../utils/secToDuration");
const CourseProgress = require("../models/CourseProgress")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection");
const RatingAndReview = require("../models/RatingAndReview");
const CourseAssignment = require("../models/AllocatedCourse");
const mongoose = require("mongoose");

// Function to create a new course
exports.createCourse = async (req, res) => {
	try {
		// Get user ID from request object
		const userId = req.user.id;

		// Get all required fields from request body
		let {
			courseName,
			courseCode,
			courseDescription,
			whatYouWillLearn,
			tag,
			category,
			status,
			instructions,
		} = req.body;

		console.log("Create course body: ", req.body)

		// Get thumbnail image from request files
		const thumbnail = req.files.thumbnailImage;

		// Check if any of the required fields are missing
		if (
			!courseName ||
			!courseDescription ||
			!whatYouWillLearn ||
			!tag ||
			!thumbnail ||
			!category ||
			!courseCode
		) {
			return res.status(400).json({
				success: false,
				message: "All Fields are Mandatory",
			});
		}

		// Set default status if not provided
		if (!status || status === undefined) {
			status = "Draft";
		}

		// Check if the user is an instructor
		const instructorDetails = await User.findById(userId);
		if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
			return res.status(404).json({
				success: false,
				message: "Instructor Details Not Found",
			});
		}
		
		const department = instructorDetails.department;

		// Check if the category exists
		const categoryDetails = await Category.findById(category);
		if (!categoryDetails) {
			return res.status(404).json({
				success: false,
				message: "Category Details Not Found",
			});
		}

		// Upload the Thumbnail to Cloudinary
		const thumbnailImage = await uploadImageToCloudinary(
			thumbnail,
			process.env.FOLDER_NAME
		);
		
		// Create a new course with the given details
		const newCourse = await Course.create({
			courseName,
			courseCode,
			courseDescription,
			instructor: instructorDetails._id,
			department: department,
			whatYouWillLearn,
			tag: JSON.parse(tag),
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status,
			instructions: JSON.parse(instructions),
		});

		// Return the new course and a success message
		res.status(200).json({
			success: true,
			data: newCourse,
			message: "Course Created Successfully",
		});
	} catch (error) {
		// Handle any errors that occur during the creation of the course
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to create course",
			error: error.message,
		});
	}
};

exports.getAllCourses = async (req, res) => {
	try {
		const allCourses = await Course.find(
			{},
			{
				courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				// ratingAndReviews: true,
				// studentsEnroled: true,
			}
		)
			.populate("instructor")
			.exec();
		return res.status(200).json({
			success: true,
			data: allCourses,
		});
	} catch (error) {
		console.log(error);
		return res.status(404).json({
			success: false,
			message: `Can't Fetch Course Data`,
			error: error.message,
		});
	}
};

//getCourseDetails - can be accessed by anyone
exports.getCourseDetails = async (req,res)=>{
	try {
		const userId = req?.user?.id; // coming from middleware - addUserToRequest
		const {courseId}=req.body;
		let enrollmentStatus = "not-assigned";
		if(userId) {
			const user = await User.findById(userId);
			if(user) {
				const assignment = await CourseAssignment.findOne({course: courseId, student: userId});
				if(assignment) {
					if(assignment.isEnrolled == true) {
						enrollmentStatus = "enrolled";
					}
					else {
						enrollmentStatus = "un-enrolled";
					}
				}
			}
		}

		const courseDetails = await Course.find({_id: courseId})
			.populate({
				path:"instructor",
				populate:{path:"additionalDetails"}
			})
			.populate("category")
			.populate({
				path:"courseContent",
				populate:{path:"subSection", select: "title timeDuration description"}
			})
			.lean();


		if(!courseDetails || courseDetails.length === 0){
			return res.status(404).json({
	            success:false,
	            message:"Course Not Found"
	        })
		}

		const studentsEnrolled = await CourseAssignment.countDocuments({course: courseId, isEnrolled: true});

		const ratingAndReviews = await RatingAndReview.find({course:courseId}).populate('user').limit(10);
		let avgRating = 0;

		const rating = await RatingAndReview.aggregate([
			{
				$match: {
					course: new mongoose.Types.ObjectId(courseId),
					user: new mongoose.Types.ObjectId(userId),
				},
			},
			{
				$group: {
					_id: null,
					avgRating: {$avg: "$rating"},
					count: {$sum: 1}
				}
			}
		])
		if(rating?.length > 0) {
			avgRating = rating[0].avgRating
		}

		const firstVideo = await SubSection.findById(courseDetails[0]?.courseContent?.[0]?.subSection[0]?._id)

		avgRating = Math.round(avgRating * 10)/10;
		courseDetails[0].avgRating = avgRating;
		courseDetails[0].enrollmentStatus = enrollmentStatus;
		courseDetails[0].studentsEnrolled = studentsEnrolled;
		courseDetails[0].ratingAndReviews = ratingAndReviews;
		courseDetails[0].totalRatings = rating[0]?.count || 0;
		courseDetails[0].firstVideoUrl = firstVideo?.videoUrl;

		console.log("\n********************************");
		console.log("Course Details:", courseDetails[0]);
		console.log("**********************************");
		
		return res.status(200).json({
	        success:true,
			message:"Course details fetched successfully",
	        data:courseDetails[0]
	    });
		
	} catch (error) {
		console.error("Error in getCourseDetails:", error);
        return res.status(500).json({
            success:false,
			message:"Failed to fetch course details",
			error:process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        })
	}
}

// used by instructor
// Function to get all courses of a particular instructor
exports.getInstructorCourses = async (req, res) => {
	try {
		// Get user ID from request object
		const userId = req.user.id;

		// Find all courses of the instructor with populated sections and subsections
		const allCourses = await Course.find({ instructor: userId })
			.populate({
				path: "category",
				select: "name"
			})
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection"
				}
			});

		// Calculate total duration for each course
		const coursesWithDuration = allCourses.map(course => {
			let totalDurationInSeconds = 0;
			
			// Calculate total duration from all subsections
			course.courseContent?.forEach(section => {
				section.subSection?.forEach(subSection => {
					if (subSection.timeDuration) {
						totalDurationInSeconds += parseInt(subSection.timeDuration);
					}
				});
			});

			// Convert seconds to hours and minutes
			const hours = Math.floor(totalDurationInSeconds / 3600);
			const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
			const seconds = totalDurationInSeconds % 60;
			
			// Format duration string
			let duration = "";
			if (hours > 0) {
				duration += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
			}
			if (minutes > 0) {
				if (duration) duration += " ";
				duration += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
			}
			if (seconds > 0) {
				if (duration) duration += " ";
				duration += `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
			}
			if (!duration) duration = "0 seconds";

			// Add duration to course object
			return {
				...course.toObject(),
				duration
			};
		});

		// Return all courses of the instructor with duration
		res.status(200).json({
			success: true,
			data: coursesWithDuration,
		});
	} catch (error) {
		// Handle any errors that occur during the fetching of the courses
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch courses",
			error: error.message,
		});
	}
};

//Edit Course Details
exports.editCourse = async (req, res) => {
	try {
		const { courseId } = req.body;
		const updates = req.body;
		console.log("updates", updates);
		const course = await Course.findById(courseId);

		if (!course) {
			return res.status(404).json({ 
				success: false,
				message: "Course not found" 
			});
		}

		// Check if course code is being updated and if it already exists
		if (updates.courseCode && updates.courseCode !== course.courseCode) {
			const existingCourse = await Course.findOne({ 
				courseCode: updates.courseCode,
				_id: { $ne: courseId } // Exclude current course from the check
			});
			
			if (existingCourse) {
				return res.status(400).json({
					success: false,
					message: "Course code already exists"
				});
			}
		}

		// If category is being updated, verify it exists and convert to ObjectId
		if (updates.category) {
			try {
				// Verify the category exists
				const categoryExists = await Category.findById(updates.category);
				if (!categoryExists) {
					return res.status(404).json({
						success: false,
						message: "Category not found"
					});
				}
				
				// Update the category field with the proper ObjectId
				course.category = categoryExists._id;
			} catch (error) {
				return res.status(400).json({
					success: false,
					message: "Invalid category ID format",
					error: error.message
				});
			}
		}

		// If Thumbnail Image is found, update it
		if (req.files) {
			console.log("thumbnail update");
			const thumbnail = req.files.thumbnailImage;
			const thumbnailImage = await uploadImageToCloudinary(
				thumbnail,
				process.env.FOLDER_NAME
			);
			course.thumbnail = thumbnailImage.secure_url;
		}

		// Update only the fields that are present in the request body
		for (const key in updates) {
			if (updates.hasOwnProperty(key)) {
				if (key === "tag" || key === "instructions") {
					course[key] = JSON.parse(updates[key]);
				} else if (key !== "courseId" && key !== "thumbnailImage" && key !== "category") { // Skip courseId, thumbnailImage, and category
					course[key] = updates[key];
				}
			}
		}

		await course.save();

		const updatedCourse = await Course.findOne({
			_id: courseId,
		})
			.populate({
				path: "instructor",
				populate: {
					path: "additionalDetails",
				},
			})
			.populate("category")
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		res.json({
			success: true,
			message: "Course updated successfully",
			data: updatedCourse,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

//get full course details
exports.getFullCourseDetails = async (req, res) => {
	try {
		const { courseId } = req.body;
		const userId = req.user.id;

		// const course = await Course.findById(courseId).populate("department");
		// const departmentHod = course.department.hod;
		// const instructor = course.instructor;

		// if(userId !== instructor && userId !== departmentHod) {
		// 	console.log("User is not authorized to view this course");
		// 	return res.status(403).json({
		// 		success: false,
		// 		message: "You are not authorized to view this course"
		// 	});
		// }		

		// Find course with populated fields
		const courseDetails = await Course.findOne({
			_id: courseId,
		})
			.populate({
				path: "instructor",
				populate: {
					path: "additionalDetails",
				},
			})
			.populate("category")
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		if (!courseDetails) {
			return res.status(400).json({
				success: false,
				message: `Could not find course with id: ${courseId}`,
			});
		}

		// Get course progress for the user
		const courseProgress = await CourseProgress.findOne({
			courseID: courseId,
			userID: userId,
		});

		// Calculate total duration
		let totalDurationInSeconds = 0;
		courseDetails.courseContent?.forEach((content) => {
			content.subSection?.forEach((subSection) => {
				if (subSection?.timeDuration) {
					totalDurationInSeconds += parseInt(subSection.timeDuration);
				}
			});
		});

		const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

		// Get course assignment details if exists
		const courseAssignment = await CourseAssignment.findOne({
			course: courseId,
			student: userId,
		}).populate("completedLectures");

		// Prepare completed videos array
		let completedVideos = [];
		if (courseProgress?.completedVideos?.length > 0) {
			completedVideos = courseProgress.completedVideos;
		} else if (courseAssignment?.completedLectures?.completedVideos?.length > 0) {
			completedVideos = courseAssignment.completedLectures.completedVideos;
		}

		return res.status(200).json({
			success: true,
			data: {
				courseDetails,
				totalDuration,
				completedVideos,
				courseAssignment: courseAssignment || null,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//Delete Course
exports.deleteCourse = async (req, res) => {
	try {
		const { courseId } = req.body
		// Find the course
		const course = await Course.findById(courseId)
		if (!course) {
			return res.status(404).json({ message: "Course not found" })
		}

		// Unenroll students from the course
		const studentsEnrolled = course.studentsEnrolled
		for (const studentId of studentsEnrolled) {
			await User.findByIdAndUpdate(studentId, {
				$pull: { courses: courseId },
			})
		}

		// Delete sections and sub-sections
		const courseSections = course.courseContent
		for (const sectionId of courseSections) {
			// Delete sub-sections of the section
			const section = await Section.findById(sectionId)
			if (section) {
				const subSections = section.subSection
				for (const subSectionId of subSections) {
					await SubSection.findByIdAndDelete(subSectionId);
				}
			}

			// Delete the section
			await Section.findByIdAndDelete(sectionId)
		}

		// Delete the course
		await Course.findByIdAndDelete(courseId)

		//Delete course id from Category
		await Category.findByIdAndUpdate(course.category._id, {
			$pull: { courses: courseId },
		})

		//Delete course id from Instructor
		await User.findByIdAndUpdate(course.instructor._id, {
			$pull: { courses: courseId },
		})

		return res.status(200).json({
			success: true,
			message: "Course deleted successfully",
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		})
	}
}

//search course by title,description and tags array
exports.searchCourse = async (req, res) => {
	try {
		const  { searchQuery }  = req.body
	//   console.log("searchQuery : ", searchQuery)
		const courses = await Course.find({
			$or: [
				{ courseName: { $regex: searchQuery, $options: "i" } },
				{ courseDescription: { $regex: searchQuery, $options: "i" } },
				{ tag: { $regex: searchQuery, $options: "i" } },
			],
		})
		.populate({
			path: "instructor",  })
		.populate("category")
		.populate("ratingAndReviews")
		.exec();

		return res.status(200).json({
			success: true,
			data: courses,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		})
	}		
}					

//mark lecture as completed
exports.markLectureAsComplete = async (req, res) => {
	const { courseId, subSectionId, userId } = req.body;
	if (!courseId || !subSectionId || !userId) {
		return res.status(400).json({
			success: false,
			message: "Missing required fields",
		});
	}
	try {
		const currentTime = new Date();

		// Find and update CourseProgress
		const courseProgress = await CourseProgress.findOne({
			userID: userId,
			courseID: courseId,
		});

		if (!courseProgress) {
			return res.status(404).json({
				success: false,
				message: "Course progress not found",
			});
		}

		// Update CourseProgress
		if (!courseProgress.completedVideos.includes(subSectionId)) {
			await CourseProgress.findOneAndUpdate(
				{
					userID: userId,
					courseID: courseId,
				},
				{
					$push: { completedVideos: subSectionId },
					$inc: { watchedLectures: 1 },
					lastAccessed: currentTime
				}
			);
		} else {
			// Even if video is already completed, update lastAccessed
			await CourseProgress.findOneAndUpdate(
				{
					userID: userId,
					courseID: courseId,
				},
				{
					lastAccessed: currentTime
				}
			);
		}

		// Update CourseAssignment lastAccessed
		await CourseAssignment.findOneAndUpdate(
			{
				course: courseId,
				student: userId
			},
			{
				lastAccessed: currentTime
			}
		);

		return res.status(200).json({
			success: true,
			message: "Lecture marked as complete and timestamps updated",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get pending courses for HOD approval
exports.getPendingCourses = async (req, res) => {
	console.log("Fetching pending courses for HOD approval")
	try {
		// Get the HOD's department
		const hod = await User.findById(req.user.id).select('department');
		if (!hod) {
			return res.status(404).json({
				success: false,
				message: "HOD not found"
			});
		}

		// Find courses that are not approved in the HOD's department
		const pendingCourses = await Course.find({
			department: hod.department,
			status: "Published",
			approved: false
		})
		.populate('instructor', 'firstName lastName email')
		.populate('category')
		.populate('department').lean();


		// ***************************** attaching duration to each course *****************
		const allCourses = await Course.find({
			department: hod.department,
			status: "Published",
			approved: false
		})
		.populate({
			path: "category",
			select: "name"
		})
		.populate({
			path: "courseContent",
			populate: {
				path: "subSection"
			}
		});

		// Calculate total duration for each course
		allCourses.forEach(course => {
			let totalDurationInSeconds = 0;
			
			// Calculate total duration from all subsections
			course.courseContent?.forEach(section => {
				section.subSection?.forEach(subSection => {
					if (subSection.timeDuration) {
						totalDurationInSeconds += parseInt(subSection.timeDuration);
					}
				});
			});

			// Convert seconds to hours and minutes
			const hours = Math.floor(totalDurationInSeconds / 3600);
			const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
			const seconds = totalDurationInSeconds % 60;
			
			// Format duration string
			let duration = "";
			if (hours > 0) {
				duration += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
			}
			if (minutes > 0) {
				if (duration) duration += " ";
				duration += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
			}
			if (seconds > 0) {
				if (duration) duration += " ";
				duration += `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
			}
			if (!duration) duration = "0 seconds";

			pendingCourses.find(pendingCourse => pendingCourse._id.toString() === course._id.toString()).duration = duration;
		});

		// ******************************

		return res.status(200).json({
			success: true,
			message: "Pending courses fetched successfully",
			data: pendingCourses
		});
	} catch (error) {
		console.error("Error fetching pending courses:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch pending courses",
			error: error.message
		});
	}
};

// Approve a course
exports.approveCourse = async (req, res) => {
	try {
		const { courseId } = req.body;

		// Get the HOD's department
		const hod = await User.findById(req.user.id).select('department');
		if (!hod) {
			return res.status(404).json({
				success: false,
				message: "HOD not found"
			});
		}

		// Find the course and verify it belongs to HOD's department
		const course = await Course.findOne({
			_id: courseId,
			department: hod.department,
			approved: false
		});

		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found, not in your department, or already approved"
			});
		}

		// Update course approved flag to true
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{ approved: true },
			{ new: true }
		)
		.populate('instructor', 'firstName lastName email')
		.populate('category')
		.populate('department');

		return res.status(200).json({
			success: true,
			message: "Course approved successfully",
			data: updatedCourse
		});
	} catch (error) {
		console.error("Error approving course:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to approve course",
			error: error.message
		});
	}
};

// for hod's Department Courses section
exports.getAllDepartmentCourses = async (req, res) => {
	try {
		// Get the HOD's department from the user record
		const hod = await User.findById(req.user.id).select("department");
		if (!hod) {
			return res.status(404).json({
				success: false,
				message: "HOD not found",
			});
		}

		// Find all courses in the HOD's department
		const courses = await Course.find({ department: hod.department })
			.populate({
				path: "instructor",
				select: "firstName lastName email",
			})
			.populate({
				path: "category",
				select: "name description",
			})
			.populate({
				path: "department",
				select: "name description",
			})
			.sort({ createdAt: -1 }).lean();

		const promises = courses.map(async (course, index) => {
			const total_allocations = await CourseAssignment.countDocuments({course: course._id});
			const total_enrollment = await CourseAssignment.countDocuments({course: course._id, isEnrolled: true});

			course.total_allocation = total_allocations;
			course.total_enrollment = total_enrollment;
		})

		await Promise.all(promises);

		// ***************************** attaching duration to each course *****************
		const allCourses = await Course.find({ department: hod.department })
		.populate({
			path: "category",
			select: "name"
		})
		.populate({
			path: "courseContent",
			populate: {
				path: "subSection"
			}
		});

		// Calculate total duration for each course
		allCourses.forEach(course => {
			let totalDurationInSeconds = 0;
			
			// Calculate total duration from all subsections
			course.courseContent?.forEach(section => {
				section.subSection?.forEach(subSection => {
					if (subSection.timeDuration) {
						totalDurationInSeconds += parseInt(subSection.timeDuration);
					}
				});
			});

			// Convert seconds to hours and minutes
			const hours = Math.floor(totalDurationInSeconds / 3600);
			const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
			const seconds = totalDurationInSeconds % 60;
			
			// Format duration string
			let duration = "";
			if (hours > 0) {
				duration += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
			}
			if (minutes > 0) {
				if (duration) duration += " ";
				duration += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
			}
			if (seconds > 0) {
				if (duration) duration += " ";
				duration += `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
			}
			if (!duration) duration = "0 seconds";

			courses.find(pendingCourse => pendingCourse._id.toString() === course._id.toString()).duration = duration;
		});

		// ******************************
			
			

		if (!courses || courses.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No courses found in your department",
			});
		}
		console.log("Courses with allocations count: ", courses)

		return res.status(200).json({
			success: true,
			message: "Courses fetched successfully",
			data: courses,
		});
	} catch (error) {
		console.error("Error fetching department courses:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch department courses",
			error: error.message,
		});
	}
};

exports.getApprovedInstructorCourses = async (req, res) => {
	try {
		// Get the instructor's ID from the request
		const instructorId = req.user.id;

		// Find all approved courses created by this instructor
		const approvedCourses = await Course.find({
			instructor: instructorId,
			approved: true,
		})
			.populate("category")
			.populate("department")
			.sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			message: "Approved courses fetched successfully",
			data: approvedCourses,
		});
	} catch (error) {
		console.error("Error fetching instructor's approved courses:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to fetch approved courses",
			error: error.message,
		});
	}
};

// for instructor and hod to get first course's section and subsection ids
exports.getCourseFirstSectionAndSubSectionIds = async (req, res) => {
	try {
		const {courseId} = req.params;
		if(!courseId) {
			console.log("Course id is required for getting section and subsection ids")
			return res.status(400).json({
				success: false,
				message: "Course ID is required"
			});
		}

		const course = await Course.findById(courseId)
			.populate({
				path: "courseContent", 
				populate: {
					path: "subSection",
				}
			})

		if(!course) {
			console.log("Course not found");
			return res.status(404).json({
				success: false,
				message: "Course not found"
			});
		}

		const firstSection = course.courseContent[0]?._id;
		const firstSubSection = course.courseContent[0]?.subSection[0]?._id;
		const data = [firstSection, firstSubSection];
		return res.status(200).json({
			success: true, 
			data: data,
		})

	} catch(error) {
		console.log("Internal server error at first section and subsection of course: ", error)
		return res.status(500).json({
			success: false,
			messsage: "Failed to give course's details"
		})
	}
}