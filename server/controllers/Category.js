const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.categoryPageDetails = async (req, res) => {
	console.log("category page details");
	try {
		const { categoryId } = req.body;

		// Validate categoryId
		if (!categoryId) {
			return res.status(400).json({ success: false, message: "Category ID is required" });
		}

		// Get the selected category
		const selectedCategory = await Category.findById(categoryId);
		if (!selectedCategory) {
			return res.status(404).json({ success: false, message: "Category not found" });
		}

		// Get courses for the selected category
		let selectedCourses = await Course.find({
			category: categoryId,
			status: "Published"
		})
		.populate({
			path: "instructor",
			select: "firstName lastName email image additionalDetails",
			populate: { path: "additionalDetails" }
		})
		.populate({
			path: "category",
			select: "name description"
		})
		.populate({
			path: "courseContent",
			populate: { path: "subSection", select: "title timeDuration description" }
		})
		.lean();

		// Get courses for other categories
		const otherCategories = await Category.find({ _id: { $ne: categoryId } });
		let differentCourses = [];
		for (const category of otherCategories) {
			const courses = await Course.find({
				category: category._id,
				status: "Published"
			})
			.populate({
				path: "instructor",
				select: "firstName lastName email image additionalDetails",
				populate: { path: "additionalDetails" }
			})
			.populate({
				path: "category",
				select: "name description"
			})
			.populate({
				path: "courseContent",
				populate: { path: "subSection", select: "title timeDuration description" }
			})
			.lean();
			differentCourses.push(...courses);
		}

		// Add avgRating and totalRatings to each course in selectedCourses and differentCourses
		const allCourseIds = [
			...selectedCourses.map(c => c._id),
			...differentCourses.map(c => c._id)
		];
		const ratingAgg = await require('../models/RatingAndReview').aggregate([
			{ $match: { course: { $in: allCourseIds } } },
			{ $group: {
				_id: "$course",
				avgRating: { $avg: "$rating" },
				totalRatings: { $sum: 1 }
			}}
		]);
		const ratingMap = {};
		for (const r of ratingAgg) {
			ratingMap[r._id.toString()] = {
				avgRating: Math.round((r.avgRating || 0) * 10) / 10,
				totalRatings: r.totalRatings
			};
		}
		selectedCourses = selectedCourses.map(course => ({
			...course,
			avgRating: ratingMap[course._id.toString()]?.avgRating || 0,
			totalRatings: ratingMap[course._id.toString()]?.totalRatings || 0
		}));
		differentCourses = differentCourses.map(course => ({
			...course,
			avgRating: ratingMap[course._id.toString()]?.avgRating || 0,
			totalRatings: ratingMap[course._id.toString()]?.totalRatings || 0
		}));

		// Get top-selling courses across all categories (assuming 'sold' field exists)
		const allCourses = await Course.find({ status: "Published" })
			.populate({
				path: "instructor",
				select: "firstName lastName email image additionalDetails",
				populate: { path: "additionalDetails" }
			})
			.populate({
				path: "category",
				select: "name description"
			})
			.populate({
				path: "courseContent",
				populate: { path: "subSection", select: "title timeDuration description" }
			})
			.lean();

		res.status(200).json({
			success: true,
			selectedCourses,
			differentCourses,
		});
	} catch (error) {
		console.log("error in category page details", error.message);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

// noo need
//add course to category
exports.addCourseToCategory = async (req, res) => {
	const { courseId, categoryId } = req.body;
	// console.log("category id", categoryId);
	try {
		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
		if(category.courses.includes(courseId)){
			return res.status(200).json({
				success: true,
				message: "Course already exists in the category",
			});
		}
		category.courses.push(courseId);
		await category.save();
		return res.status(200).json({
			success: true,
			message: "Course added to category successfully",
		});
	}
	catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
}