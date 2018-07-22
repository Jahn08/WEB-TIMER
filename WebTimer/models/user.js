const mongoose = require('mongoose');

const constants = require('./constants');

let user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: constants.NAME_LENGTH
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        maxlength: constants.NAME_LENGTH
    },
    facebookId: String,
    lastLogin: Date,
    administrator: Boolean,
    hideDefaultPrograms: Boolean,
    location: String,
    gender: String
}, { timestamps: true });

module.exports = mongoose.model("User", user);