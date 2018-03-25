const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const users = require('../models/user');
let router = express.Router();

router.post('/signUp', (req, res, next) => {

    })
    .post('/signIn', (req, res, next) => {

    })
    .get('/signOut', (req, res, next) => {
        
    });

exports = router;