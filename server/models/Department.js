const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    institute: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Institute",
        required: true 
    },
    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Department', departmentSchema);