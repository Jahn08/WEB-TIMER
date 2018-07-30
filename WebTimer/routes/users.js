const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const facebookAuth = require('../facebook-auth');

const User = require('../models/user');

const dbModelHelpers = require('../tools/db-model-helpers');
const userModelHelper = new dbModelHelpers.UserModelHelper();

const ITEMS_PER_PAGE = require('../models/constants').ITEMS_PER_PAGE;

const router = express.Router();
router.route('/')
    .get(facebookAuth.verifyUser, facebookAuth.verifyAdmin, (req, res, next) => {
        if (req.query) {
            userModelHelper.setReponse(res);

            const query = req.query;

            const pageNum = query.page || 1;
            const searchFor = query.searchFor;

            const sortField = query.sortField || 'name';
            const sortDirection = query.sortDirection || -1;

            let sortOption = { };
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
                        users: sortDirection == 1 ? _users.sort((a, b) => a[sortField] > b[sortField]):
                            _users.sort((a, b) => a[sortField] < b[sortField]),
                        pageCount
                    });
                });
            });
        }
    })
    .delete((req, res, next) => {
        // TODO: Deleting a user's profile, available for the user themselves
    });

module.exports = router;