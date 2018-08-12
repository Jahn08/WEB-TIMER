const express = require('express');
let app = express();

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
    .get(facebookAuth.verifyUser, facebookAuth.verifyAdmin, (req, res, next) => {
        if (req.query) {
            const userModelHelper = new dbModelHelpers.UserModelHelper(res);

            const query = req.query;

            const pageNum = query.page || 1;
            const searchFor = query.searchFor;

            const sortField = query.sortField || 'name';
            const sortDirection = query.sortDirection || -1;

            let sortOption = {};
            sortOption[sortField] = sortDirection;

            userModelHelper.getUsersForPage(pageNum, searchFor, sortOption).then(queryResp => {
                let promises = [];
                const programModelHelper = new dbModelHelpers.ProgramModelHelper(res);

                const _users = [];

                queryResp.users.forEach(u => {
                    promises.push(programModelHelper.getNumberOfUserActivePrograms(u._id.toString())
                        .then(count => {
                            const _user = JSON.parse(JSON.stringify(u));
                            _user.activeProgramCount = count;

                            _users.push(_user);
                        }));
                });

                Promise.all(promises).then(() => {
                    const pageCount = Math.ceil(queryResp.count / ITEMS_PER_PAGE);

                    res.json({
                        queryFilter: {
                            page: pageNum > pageCount ? 1 : pageNum,
                            searchFor,
                            sortField,
                            sortDirection
                        },
                        users: sortDirection == 1 ? _users.sort((a, b) => a[sortField] > b[sortField]) :
                            _users.sort((a, b) => a[sortField] < b[sortField]),
                        pageCount
                    });
                });
            });
        }
    });

router.route('/profile')
    .get(facebookAuth.verifyUser, (req, res, next) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        res.status(200).json({ hideDefaultPrograms: user.hideDefaultPrograms });
    })
    .post(facebookAuth.verifyUser, (req, res, next) => {
        const respErr = new ResponseError(res);
        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        user.update({ $set: { hideDefaultPrograms: req.body.hideDefaultPrograms } }).then((resp, err) => {
            if (err)
                respErr.respondWithDatabaseError(err);

            res.status(204).end();
        });
    })
    .delete(facebookAuth.verifyUser, (req, res, next) => {
        const userModelHelper = new dbModelHelpers.UserModelHelper(res);
        const respErr = new ResponseError(res);

        const user = req.user;

        if (!user)
            return respErr.respondWithUserIsNotFoundError();

        user.remove(err => {
            if (err)
                respErr.respondWithDatabaseError(err);
            else {
                const programModelHelper = new dbModelHelpers.ProgramModelHelper(res);

                programModelHelper.findUserPrograms(user.id).then(programs => {
                    programModelHelper.reduceProgramsToList(programs, []).then(() => {
                        new Mailer(config).sendAccountRemovalMsg(user.email, user.name).then(info => res.status(204).end());
                    });
                });
            }
        });
    });

module.exports = router;