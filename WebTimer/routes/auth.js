const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const User = require('../models/user');
let router = express.Router();

const facebokAuth = require('../facebook-auth'); 

const ResponseError = require('../response-error').ResponseError;

router.route('/logIn').post(facebokAuth.verifyUser, (req, res, next) => {
    let respErr = new ResponseError(res);

    if (!req.user)
        return respErr.respondWithUserIsNotFoundError();

    User.findOne({ facebookId: req.user.facebookId }, (err, user) => {
        if (err)
            return respErr.respondWithAuthenticationError(err);

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        user.update({ lastLogin: Date.now() }, (err) => {
            if (err)
                return respErr.respondWithAuthenticationError(err);

            res.end('Successfully logged in.');
            next();
        });
    });
});

module.exports = router;