const mongoose = require("mongoose");

const courseAssignmentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course"
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Institute"
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Department"
    },
    isEnrolled: {
        type: Boolean,
        default: false
    },
    enrollmentDate: {
        type: Date,
        default: null
    },
    validityEndDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["Active", "Expired"],
        default: "Active"
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // This is the array of lectures that the student has completed
    completedLectures: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress"
    },
    ratingAndReview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview"
    },
    lastAccessed: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("CourseAssignment", courseAssignmentSchema); 