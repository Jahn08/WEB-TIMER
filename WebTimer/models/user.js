const mongoose = require('mongoose');

const constants = require('./constants');

let user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: constants.NAME_LENGTH
    },
    email: {
        type: String,
        required: true,
        maxlength: constants.NAME_LENGTH
    },
    facebookId: String,
    lastLogin: Date,
    administrator: {
        type: Boolean,
        default: false
    },
    hideDefaultPrograms: Boolean,
    defaultSoundName: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', user);