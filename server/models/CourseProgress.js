const mongoose = require("mongoose");

const courseProgress = new mongoose.Schema({
	courseID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Course",
	},
	userID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	completedVideos: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "SubSection",
		},
	],
	watchedLectures: {
		type: Number,
		default: 0,
	},
	lastAccessed: {
		type: Date
	}
});

module.exports = mongoose.model("CourseProgress", courseProgress);