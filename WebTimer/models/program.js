const mongoose = require('mongoose');

let programStage = new mongoose.Schema({
    order: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        min: 1,
        max: 3600
    },
    descr: {
        type: String,
        required: true
    }
});

let program = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    stages: [programStage],
    active: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Program', program);