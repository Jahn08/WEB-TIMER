const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const Program = require('../models/program');
const defaultPrograms = require('../models/default-program');

const User = require('../models/user');

const router = express.Router();
const facebokAuth = require('../facebook-auth');

const ResponseError = require('../response-error').ResponseError;

router.route('/')
    .get(facebokAuth.verifyUser, (req, res, next) => {
        let respErr = new ResponseError(res);
        
        User.findOne({ facebookId: req.user.facebookId }, (err, user) => {
            if (err)
                return respErr.respondWithDatabaseError(err);

            Program.find({ userId: user.id }, (err, programs) => {
                if (err)
                    return respErr.respondWithDatabaseError(err);

                res.status(200).json(programs);
            });
        });
    })
    .post(facebokAuth.verifyUser, (req, res, next) => {
        let respErr = new ResponseError(res);

        const checkDbErrorCallback = (err, resp) => {
            if (err)
                return respErr.respondWithDatabaseError(err);
        };

        User.findOne({ facebookId: req.user.facebookId }, (err, user) => {
            if (err)
                return respErr.respondWithDatabaseError(err);

            let newPrograms = [];

            Program.find({ userId: user.id }, (err, foundPrograms) => {
                if (err)
                    return respErr.respondWithDatabaseError(err);

                let bodyPrograms = req.body.programs;

                bodyPrograms.forEach((newProgram) => {
                    let item = foundPrograms.find(pr => pr._id.toString() === newProgram._id);

                    if (item) {
                        item.name = newProgram.name;
                        item.stages = newProgram.stages;
                        item.active = newProgram.active;

                        item.save(checkDbErrorCallback);
                    }
                    else {
                        newProgram._id = undefined;
                        newProgram.userId = user.id;

                        newPrograms.push(newProgram);
                    }
                });

                if (newPrograms.length > 0) {
                    Program.create(newPrograms, checkDbErrorCallback);
                }

                const actualPrograms = bodyPrograms.filter(p => p._id);
                foundPrograms.forEach((serverProgram) => {
                    if (actualPrograms.every(p => p._id !== serverProgram._id.toString()))
                        serverProgram.remove(checkDbErrorCallback);
                });

                res.redirect(req.baseUrl);
            });

        });
    });

router.route('/default').get((req, res, next) => {
    res.status(200).json(defaultPrograms);
});

module.exports = router;