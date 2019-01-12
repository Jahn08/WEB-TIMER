const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

let router = express.Router();

const facebokAuth = require('../facebook-auth'); 

const ResponseError = require('../tools/response-error').ResponseError;

const loggerContext = require('../config').logger.startLogging('LogIn');

router.route('/logIn').post(facebokAuth.verifyUser, (req, res, next) => {
    let respErr = new ResponseError(res);
    const user = req.user;

    if (!user)
        return respErr.respondWithUserIsNotFoundError();

    loggerContext.info(`Logged in user is ${JSON.stringify(user)}`);

    user.update({ lastLogin: Date.now() }, (err) => {
        if (err)
            return respErr.respondWithAuthenticationError(err);

        res.status(200).json({ hasAdminRole: user.administrator });
        next();
    });
});

module.exports = router;