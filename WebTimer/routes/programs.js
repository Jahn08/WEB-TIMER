const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const programs = require('../models/program');
let router = express.Router();

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
    })
    .get('/default', (req, res, next) => {
        // TODO: Getting a list of all default programs, a public method
    });

exports = router;