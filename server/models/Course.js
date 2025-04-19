const mongoose = require("mongoose");

// Define the Courses schema
const coursesSchema = new mongoose.Schema({
	courseName: { 
		type: String,
		required: true 
	},
	courseCode: {
		type: String,
		required: true,
	},
	courseDescription: { 
		type: String,
		required: true 
	},
	instructor: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	department: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Department",
	},
	whatYouWillLearn: {
		type: String,
		required: true
	},
	courseContent: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Section",
		},
	],
	// ratingAndReviews: [
	// 	{
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "RatingAndReview",
	// 	},
	// ],
	price: {
		type: Number,
	},
	thumbnail: {
		type: String,
		required: true
	},
	tag: {
		type: [String],
		required: true,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		// required: true,
		ref: "Category",
	},
	validityDuration: {
		type: Number, // Duration in days
		required: true,
		default: 30 // or whatever you want as a base
	},
	// studen
	// tsEnrolled: [
	// 	{
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		required: true,
	// 		ref: "User",
	// 	},
	// ],
	instructions: {
		type: [String],
		required: true
	},
	status: {
		type: String,
		enum: ["Draft", "Published"],
		default: "Draft"
	},
	approved: {
		type: Boolean,
		default: false,
	},
},
{ timestamps: true }
);

// Export the Courses model
module.exports = mongoose.model("Course", coursesSchema);