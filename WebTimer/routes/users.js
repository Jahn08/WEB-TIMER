const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const users = require('../models/user');
let router = express.Router();

router.route('/')
    .get((req, res, next) => {
        // TODO: Getting a list of all users, available for only an administrator
    })
    .delete((req, res, next) => {
        // TODO: Deleting a user's profile, available for the user themselves
    });

exports = router;