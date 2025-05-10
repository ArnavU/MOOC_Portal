const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    subsection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection"
    },
    title: {
        type: String, 
        required: true
    }
})

const quizModel = mongoose.model('Quiz', quizSchema);
module.exports = quizModel;