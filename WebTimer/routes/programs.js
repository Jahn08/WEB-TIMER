const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const router = express.Router();
const facebokAuth = require('../facebook-auth');

const defaultPrograms = require('../models/default-program');
const getDefaultSounds = require('../models/default-sounds');

const dbModelHelper = require('../tools/db-model-helpers');
const ProgramModelHelper = dbModelHelper.ProgramModelHelper;

const ResponseError = require('../tools/response-error').ResponseError;

const logger = require('../config').logger;

const validate = require('../tools/validate');

router.route('/')
    .get(facebokAuth.verifyUser, ResponseError.catchAsyncError(async (req, res) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        const programModelHelper = new ProgramModelHelper(res, user.id);

        const programs = await programModelHelper.findUserPrograms(user.id);
        res.status(200).json({ programs, schemaRestrictions: ProgramModelHelper.getShemaRestrictions() });
    }))
    .post(facebokAuth.verifyUser, ResponseError.catchAsyncError(async (req, res) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        const reqBody = validate(req.body);

        const programModelHelper = new ProgramModelHelper(res, user.id);
        await programModelHelper.deletePrograms(reqBody.deletedIds);
        await programModelHelper.updatePrograms(reqBody.updated);
        await programModelHelper.createPrograms(reqBody.created);

        res.redirect(req.baseUrl);
    }));

router.route('/active').get(facebokAuth.verifyUser, ResponseError.catchAsyncError(async (req, res) => {
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
}));

router.route('/default').get((req, res) => res.status(200).json(defaultPrograms));

router.route('/sounds').get(facebokAuth.verifyUser, (req, res) => {
    const respErr = new ResponseError(res);
    const user = req.user;

    const loggerContext = logger.startLogging('GetSoundsForUser');

    if (!user)
        return respErr.respondWithUserIsNotFoundError();
        
    loggerContext.info(`The user's id=${user.id}, the default sound=${user.defaultSoundName}`);
    res.status(200).json(getDefaultSounds(user.defaultSoundName));
});

router.route('/defaultSounds').get((req, res) => res.status(200).json(getDefaultSounds()));

module.exports = router;
