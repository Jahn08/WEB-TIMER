const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const router = express.Router();
const facebokAuth = require('../facebook-auth');

const defaultPrograms = require('../models/default-program');

const dbModelHelper = require('../tools/db-model-helpers');
const ProgramModelHelper = dbModelHelper.ProgramModelHelper;

const ResponseError = require('../tools/response-error').ResponseError;

const logger = require('../config').logger;

router.route('/')
    .get(facebokAuth.verifyUser, (req, res, next) => {
        let respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        const programModelHelper = new ProgramModelHelper(res);

        programModelHelper.findUserPrograms(user.id).then(programs => {
            res.status(200).json({ programs, schemaRestrictions: programModelHelper.getShemaRestrictions() });
        });
    })
    .post(facebokAuth.verifyUser, (req, res, next) => {
        let respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        const programModelHelper = new ProgramModelHelper(res);
        const userId = user.id;

        programModelHelper.findUserPrograms(userId).then(dbPrograms => {
            let requestPrograms = req.body.programs || [];

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

router.route('/active').get(facebokAuth.verifyUser, (req, res, next) => {
    let respErr = new ResponseError(res);
    const user = req.user;

    const loggerContext = logger.startLogging('GetActivePrograms');

    if (!user)
        return respErr.respondWithUserIsNotFoundError();

    const programModelHelper = new ProgramModelHelper(res);

    programModelHelper.findUserActivePrograms(user.id).then(programs => {
        let overallPrograms = programs;

        if (!programs.length || !user.hideDefaultPrograms) {
            loggerContext.info('Adding default programs to the user\'s active ones');
            overallPrograms = defaultPrograms.concat(programs).sort((a, b) => a.name > b.name);
        }

        res.status(200).json(overallPrograms);
    });
});

router.route('/default').get((req, res, next) => {
    res.status(200).json(defaultPrograms);
});

module.exports = router;