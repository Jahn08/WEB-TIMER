﻿const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

let router = express.Router();

const facebokAuth = require('../facebook-auth'); 

const ResponseError = require('../tools/response-error').ResponseError;

const dbModelHelper = require('../tools/db-model-helpers');

router.route('/logIn').post(facebokAuth.verifyUser, (req, res, next) => {
    let respErr = new ResponseError(res);
    const user = req.user;

    if (!user)
        return respErr.respondWithUserIsNotFoundError();
    
    user.update({ lastLogin: Date.now() }, (err) => {
        if (err)
            return respErr.respondWithAuthenticationError(err);

        res.status(200).json({ hasAdminRole: user.administrator });
        next();
    });
});

module.exports = router;