const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    subsection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection"
    },
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    }
}, {timestamps: true});

const quizModel = mongoose.model('Quiz', quizSchema);
module.exports = quizModel;