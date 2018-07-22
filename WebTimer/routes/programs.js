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
const userModelHelper = new UserModelHelper();

router.route('/')
    .get(facebokAuth.verifyUser, (req, res, next) => {
        userModelHelper.setReponse(res);

        userModelHelper.findUser(req.user.facebookId).then(user => {
            const programModelHelper = new ProgramModelHelper(res);

            programModelHelper.findUserPrograms(user.id).then(programs => {
                res.status(200).json({ programs, schemaRestrictions: programModelHelper.getShemaRestrictions() });
            });
        });
    })
    .post(facebokAuth.verifyUser, (req, res, next) => {
        userModelHelper.setReponse(res);

        userModelHelper.findUser(req.user.facebookId).then(user => {
            const programModelHelper = new ProgramModelHelper(res);
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

router.route('/active').get(facebokAuth.verifyUser, (req, res, next) => {
    userModelHelper.setReponse(res);
    
    userModelHelper.findUser(req.user.facebookId).then(user => {
        const programModelHelper = new ProgramModelHelper(res);

        programModelHelper.findUserActivePrograms(user.id).then(programs => {
            let overallPrograms = programs;

            if (programs.length && !user.hideDefaultPrograms)
                overallPrograms = defaultPrograms.concat(programs).sort((a, b) => a.name > b.name);

            res.status(200).json(overallPrograms);
        });
    });

});

router.route('/default').get((req, res, next) => {
    res.status(200).json(defaultPrograms);
});

module.exports = router;