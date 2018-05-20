const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const programs = require('../models/program');
let router = express.Router();

const defaultPrograms = require('../models/programDefault');

router.route('/')
    // TODO: Available to it's author only
    .get((req, res, next) => {
        // TODO: Getting a list of all user's programs
    })
    .post((req, res, next) => {
        // TODO: Creating a user's program
    })
    .put((req, res, next) => {
        // TODO: Changing a user's program
    })
    .delete((req, res, next) => {
        // TODO: Deleting a user's program
    });

router.route('/default').get((req, res, next) => {
    res.status(200).json(defaultPrograms);
});

module.exports = router;