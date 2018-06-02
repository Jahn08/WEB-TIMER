const mongoose = require('mongoose');

let user = new mongoose.Schema({
    userName: {
        type: String,
        required: true
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
        required: true
    },
    facebookId: String,
    lastLogin: Date,
    administrator: Boolean
}, { timestamps: true });

module.exports = mongoose.model("User", user);