const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

    gender: {
        type: String,
    },
    dateOfBirth: {
        type: String, 
    },
    about: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: Number,
        trim: true
    }, 
    designation: {
        type: String,
    },
    prn: {
        type: String,
    },
    rollNumber: {
        type: Number,
    },
    batch: {
        type: Number,
    },
    year: {
        type: String,
        enum: ['FY', 'SY', 'TY', 'BTech']
    },
    semester: {
        type: String,
        enum: [1, 2, 3],
    }

})


module.exports = mongoose.model("Profile", profileSchema)