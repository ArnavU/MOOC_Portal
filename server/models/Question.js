const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz"
    },
    serial: {
        type: Number, 
        required: true
    }, 
    question: {
        type: String, 
        required: true,
    }, 
    options: [
        {type: String, required: true}
    ],
    correctAnswer: {
        type: String,
        required: true
    }
})

const model = mongoose.model('Question', questionSchema);
module.exports = model;