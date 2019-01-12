const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const facebookAuth = require('../facebook-auth');

const config = require('../config');

const dbModelHelpers = require('../tools/db-model-helpers');
const ResponseError = require('../tools/response-error').ResponseError;
const Mailer = require('../tools/mailer');

const ITEMS_PER_PAGE = require('../models/constants').ITEMS_PER_PAGE;

const router = express.Router();
router.route('/')
    .get(facebookAuth.verifyUser, facebookAuth.verifyAdmin, async (req, res) => {
        const loggerContext = config.logger.startLogging('GetUsers');

        if (!req.query) {
            loggerContext.warn('An empty request query has been got');
            return;
        }

        const userModelHelper = new dbModelHelpers.UserModelHelper(res);

        const query = req.query;

        const pageNum = query.page || 1;
        const searchFor = query.searchFor;

        const sortField = query.sortField || 'name';
        const sortDirection = query.sortDirection || -1;

        const sortOption = {};
        sortOption[sortField] = sortDirection;            
        const queryResp = await userModelHelper.getUsersForPage(pageNum, searchFor, sortOption);

        loggerContext.info('Getting numbers of active programs for each user');
        
        const _users = [];

        await Promise.all(queryResp.users.map(u =>
            new dbModelHelpers.ProgramModelHelper(res, u._id.toString()).getNumberOfUserActivePrograms()
                .then(count => {
                    const _user = JSON.parse(JSON.stringify(u));

                    _users.push({
                        _id: _user._id,
                        name: _user.name,
                        administrator: _user.administrator,
                        location: _user.location,
                        gender: _user.gender,
                        lastLogin: _user.lastLogin,
                        createdAt: _user.createdAt,
                        activeProgramCount: count
                    });
                })
        ));

        const pageCount = Math.ceil(queryResp.count / ITEMS_PER_PAGE);
        loggerContext.info(`A count of pages available is ${pageCount}`);

        res.json({
            queryFilter: {
                page: pageNum > pageCount ? 1 : pageNum,
                searchFor,
                sortField,
                sortDirection
            },
            curUserId: req.user._id,
            users: sortDirection == 1 ? _users.sort((a, b) => a[sortField] > b[sortField]) :
                _users.sort((a, b) => a[sortField] < b[sortField]),
            pageCount
        });
    });

router.route('/profile')
    .get(facebookAuth.verifyUser, (req, res) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        res.status(200).json({ hideDefaultPrograms: user.hideDefaultPrograms });
    })
    .post(facebookAuth.verifyUser, async (req, res) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        const [, err] = await user.update({ $set: { hideDefaultPrograms: req.body.hideDefaultPrograms } });

        if (err)
            respErr.respondWithDatabaseError(err);

        res.status(204).end();
    })
    .delete(facebookAuth.verifyUser, (req, res) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        user.remove(async err => {
            if (err)
                respErr.respondWithDatabaseError(err);
            else {
                const programModelHelper = new dbModelHelpers.ProgramModelHelper(res, user.id);

                const programs = await programModelHelper.findUserPrograms();
                await programModelHelper.deletePrograms(programs.map(p => p._id));

                await new Mailer(config).sendAccountRemovalMsg(user.email, user.name);
                res.status(204).end();
            }
        });
    });

router.route('/adminSwitch').post(facebookAuth.verifyUser, facebookAuth.verifyAdmin, async (req, res) => {
    const userModelHelper = new dbModelHelpers.UserModelHelper(res);
    const respErr = new ResponseError(res);

    const user = req.user;

    if (!user)
        return respErr.respondWithUserIsNotFoundError();
    
    const changedUser = req.body;
    let changedUserId;

    const loggerContext = config.logger.startLogging('PostAdminSwitch');

    if (!changedUser || !(changedUserId = changedUser.id)) {
        loggerContext.warn('The user\'s data request is empty');
        return;
    }

    if (user._id.toString() === changedUserId)
        return respErr.respondWithUnexpectedError('Current user cannot change their own administrative role');

    const foundUser = await userModelHelper.findUserByIdOrEmpty(changedUserId);

    if (!foundUser)
        return respErr.respondWithUserIsNotFoundError();

    const isAdmin = !foundUser.administrator;
    const updateBody = { administrator: isAdmin };

    loggerContext.info(`The user's data is going to be updated to ${JSON.stringify(updateBody)}`);
    
    try {
        await foundUser.update({ $set: updateBody });
        await new Mailer(config).sendAdminRoleSwitchMsg(foundUser.email, foundUser.name, isAdmin);
        res.status(200).json(updateBody);
    }
    catch (err) {
        respErr.respondWithUnexpectedError(err);
    }
});

module.exports = router;