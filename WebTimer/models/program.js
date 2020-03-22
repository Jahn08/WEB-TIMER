const mongoose = require('mongoose');

const constants = require('./constants');

const programStage = new mongoose.Schema({
    order: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        min: constants.MIN_MINUTES,
        max: constants.MAX_MINUTES
    },
    descr: {
        type: String,
        required: true,
        maxlength: constants.TEXT_LENGTH
    }
});

const program = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: constants.NAME_LENGTH
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    stages: [programStage],
    active: Boolean,
    audioBetweenStages: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Program', program);
