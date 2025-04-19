const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema({
    instituteName: {
        type: String,
        required: true,
        trim: true,
    },
    instituteAddress: {
        type: String,
        required: true,
        trim: true,
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true,
    },
    instituteEmail: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    website: {
        type: String,
        trim: true,
    },
    instituteLogo: {
        type: String,
        required: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Institute", instituteSchema);