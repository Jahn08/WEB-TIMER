const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const User = require('../models/user');
let router = express.Router();

const facebokAuth = require('../facebook-auth'); 

const errorFormatter = require('../error-formatter');

router.route('/logIn').post(facebokAuth.verifyUser, (req, res, next) => {
    if (!req.user)
        return errorFormatter.respondWithUserIsNotFoundError(res);

    User.findOne({ facebookId: req.user.facebookId }, (err, user) => {
        if (err)
            return errorFormatter.respondWithAuthenticationError(res, err);

        if (!user)
            return errorFormatter.respondWithUserIsNotFoundError(res);

        user.update({ lastLogin: Date.now() }, (err) => {
            if (err)
                return errorFormatter.respondWithAuthenticationError(res, err);

            res.end('Successfully logged in.');
            next();
        });
    });
});

module.exports = router;