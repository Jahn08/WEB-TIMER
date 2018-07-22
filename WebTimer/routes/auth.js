const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

let router = express.Router();

const facebokAuth = require('../facebook-auth'); 

const ResponseError = require('../tools/response-error').ResponseError;

const dbModelHelper = require('../tools/db-model-helpers');
const UserModelHelper = dbModelHelper.UserModelHelper;

router.route('/logIn').post(facebokAuth.verifyUser, (req, res, next) => {
    let respErr = new ResponseError(res);

    if (!req.user)
        return respErr.respondWithUserIsNotFoundError();

    const userModelHelper = new UserModelHelper();
    userModelHelper.findUserOrEmpty(req.user.facebookId).then(user => {
        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        user.update({ lastLogin: Date.now() }, (err) => {
            if (err)
                return respErr.respondWithAuthenticationError(err);

            res.status(200).json({ hasAdminRole: true });
            next();
        });
    }).catch(err => respErr.respondWithAuthenticationError(err));
});

module.exports = router;