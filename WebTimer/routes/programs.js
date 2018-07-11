const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const router = express.Router();
const facebokAuth = require('../facebook-auth');

const defaultPrograms = require('../models/default-program');

const dbModelHelper = require('../tools/db-model-helpers');
const ProgramModelHelper = dbModelHelper.ProgramModelHelper;
const UserModelHelper = dbModelHelper.UserModelHelper;

const Program = require('../models/program');
const User = require('../models/user');

router.route('/')
    .get(facebokAuth.verifyUser, (req, res, next) => {
        const userModelHelper = new UserModelHelper(User);
        userModelHelper.setReponse(res);

        userModelHelper.findUser(req.user.facebookId).then(user => {
            const programModelHelper = new ProgramModelHelper(Program, res);

            programModelHelper.findUserPrograms(user.id).then(programs => {
                res.status(200).json(programs);
            });
        });
    })
    .post(facebokAuth.verifyUser, (req, res, next) => {
        const userModelHelper = new UserModelHelper(User);
        userModelHelper.setReponse(res);

        userModelHelper.findUser(req.user.facebookId).then(user => {
            const programModelHelper = new ProgramModelHelper(Program, res);
            const userId = user.id;

            programModelHelper.findUserPrograms(userId).then(dbPrograms => {
                let requestPrograms = req.body.programs;

                programModelHelper.reduceProgramsToList(dbPrograms, requestPrograms)
                    .then(reducedProgramList => {
                        let newPrograms = [];

                        requestPrograms.forEach(newProgram => {
                            let item = reducedProgramList.find(pr => pr._id.toString() === newProgram._id);

                            if (item)
                                programModelHelper.updateProgram(item, newProgram);
                            else
                                newPrograms.push(newProgram);
                        });

                        programModelHelper.createPrograms(newPrograms, userId).then(() => res.redirect(req.baseUrl));
                    });
            });
        });
    });

router.route('/default').get((req, res, next) => {
    res.status(200).json(defaultPrograms);
});

module.exports = router;