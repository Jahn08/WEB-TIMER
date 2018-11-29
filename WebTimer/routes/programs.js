const express = require('express');
const app = express();

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
    .get(facebokAuth.verifyUser, async (req, res, next) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        const programModelHelper = new ProgramModelHelper(res, user.id);

        const programs = await programModelHelper.findUserPrograms(user.id);
        res.status(200).json({ programs, schemaRestrictions: ProgramModelHelper.getShemaRestrictions() });
    })
    .post(facebokAuth.verifyUser, async (req, res, next) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        const programModelHelper = new ProgramModelHelper(res, user.id);
        await programModelHelper.deletePrograms(req.body.deleted);
        await programModelHelper.updatePrograms(req.body.updated);
        await programModelHelper.createPrograms(req.body.created);

        res.redirect(req.baseUrl);
    });

router.route('/active').get(facebokAuth.verifyUser, async (req, res, next) => {
    const respErr = new ResponseError(res);
    const user = req.user;

    const loggerContext = logger.startLogging('GetActivePrograms');

    if (!user)
        return respErr.respondWithUserIsNotFoundError();

    const programModelHelper = new ProgramModelHelper(res, user.id);
    const programs = await programModelHelper.findUserActivePrograms();
    let overallPrograms = programs;

    if (!programs.length || !user.hideDefaultPrograms) {
        loggerContext.info('Adding default programs to the user\'s active ones');
        overallPrograms = defaultPrograms.concat(programs).sort((a, b) => a.name > b.name);
    }

    res.status(200).json(overallPrograms);
});

router.route('/default').get((req, res, next) => res.status(200).json(defaultPrograms));

module.exports = router;
