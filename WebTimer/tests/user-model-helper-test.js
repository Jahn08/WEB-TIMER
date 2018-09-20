const assert = require('assert');

const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../models/user');
const ITEMS_PER_PAGE = require('../models/constants').ITEMS_PER_PAGE;

const UserModelHelper = require('../tools/db-model-helpers').UserModelHelper;

const randomiser = require('./infrastructure/randomiser');
const mock = require('./infrastructure/mock');
const expectation = require('./infrastructure/expectation');

describe('UserModelHelper', function () {
    let dbConnector;

    before(() => {
        const DbConnector = require('./infrastructure/db-connector').DbConnector;
        dbConnector = new DbConnector();

        return new Promise((resolve, reject) => {
            User.remove({}, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    });

    after(() => dbConnector.disconnect());

    this.timeout(3000);

    const getString = (obj) => obj ? obj.toString() : '';

    const createTestUsers = (callback, numberOfUsers = 1, testFields = {}) => {
        let users = [];

        for (i = 0; i < numberOfUsers; ++i) {
            users.push(new User({
                name: testFields['name'] || randomiser.getRandomIntUpToMaxInteger().toString(),
                email: testFields['email'] || randomiser.getRandomIntUpToMaxInteger().toString(),
                administrator: false,
                facebookId: randomiser.getRandomIntUpToMaxInteger()
            }));
        }

        return new Promise((resolve, reject) => {
            User.insertMany(users, ((err, _users) => {
                assert(!err, 'An error while creating test users: ' + getString(err));

                const removeUsersAndFinish = respErr => User.remove({ _id: { $in: _users.map(u => u._id) } }, err => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(!err, 'An error while removing a test user: ' + getString(err));

                        if (respErr)
                            throw new Error(respErr.toString());
                    });
                });

                callback(_users)
                    .then(removeUsersAndFinish)
                    .catch(removeUsersAndFinish);
            }));
        });
    };
    
    const testSearchingForUser = (searchMethodName, searchPropertyName, seedIdCallback) => {

        const useFindingUserMethodWithoutError = (methodToInvoke, useResponse, propertyToCompare) => {
            const testCallback = (key) => {

                return new Promise((resolve, reject) => {
                    let userModelHelper;
                    let response;

                    if (useResponse) {
                        response = mock.mockResponse();
                        userModelHelper = new UserModelHelper(response);
                    }
                    else
                        userModelHelper = new UserModelHelper();

                    const invokeMethodByName = (methodName, arg) => {
                        const methodToInvoke = userModelHelper[methodName];
                        assert(methodToInvoke);

                        return methodToInvoke(arg);
                    };

                    invokeMethodByName(methodToInvoke, key).then(foundUser => {
                        expectation.tryCatchForPromise(resolve, reject, () => {
                            assert(foundUser);
                            assert.strictEqual(foundUser[propertyToCompare].toString(), key.toString());

                            if (useResponse)
                                assert(!response.text);
                        });
                    }).catch(err => {
                        reject(err);
                    });
                });
            };

            return createTestUsers(users => {
                assert(users && users.length == 1);
                return testCallback(users[0][propertyToCompare]);
            });
        };

        const generateRandomId = () => {
            const randomNum = randomiser.getRandomIntUpToMaxInteger();

            return seedIdCallback ? seedIdCallback(randomNum) : randomNum;
        };

        describe('#' + searchMethodName, () => {
            it('should find an existent user in a database without an error in a response', () => {
                return useFindingUserMethodWithoutError(searchMethodName, true, searchPropertyName);
            });

            it('should return an empty user without rejecting and an error in a response', () => {
                const response = mock.mockResponse();
                const userModelHelper = new UserModelHelper(response);
                
                return new Promise((resolve, reject) => {
                    userModelHelper[searchMethodName](generateRandomId()).then(foundUser => {
                        expectation.tryCatchForPromise(resolve, reject, () => {
                            assert(!foundUser);
                            assert(!response.text && !response.statusCode);
                        });
                    }).catch(err => reject(err));
                });
            });

            it('should find an existent user in a database without using a response object', () => {
                return useFindingUserMethodWithoutError(searchMethodName, false, searchPropertyName);
            });

            it('should return an empty user without using a response object', () => {
                const userModelHelper = new UserModelHelper();

                return new Promise((resolve, reject) => {
                    userModelHelper[searchMethodName](generateRandomId()).then(foundUser =>
                        expectation.tryCatchForPromise(resolve, reject, () => assert(!foundUser)))
                        .catch(err => reject(err));
                });
            });
        });
    };

    testSearchingForUser('findUserOrEmpty', 'facebookId');

    testSearchingForUser('findUserByIdOrEmpty', '_id', (num) => new ObjectId(num));

    describe('#getShemaRestrictions', () => {
        it('should return correct restrictions to the User schema model', () => {
            const restrictions = new UserModelHelper().getShemaRestrictions();
            
            for (let path in restrictions) {
                for (let option in restrictions[path]) {
                    assert.strictEqual(User.schema.path(path).options[option], restrictions[path][option]);
                }
            }
        });
    });

    describe('#getUsersForPage', () => {

        const testGettingUsersForPage = (pageNum, useSearch, sortEmailDirection) => {
            const userModelHelper = new UserModelHelper();

            let allUsers = [];

            return createTestUsers(users1 => {

                return createTestUsers(users2 => {
                    allUsers.unshift(...users2);
                    allUsers.unshift(...users1);

                    return new Promise((resolve, reject) => {
                        const sortOption = sortEmailDirection ? { email: sortEmailDirection } : undefined;
                        const searchedName = useSearch ? 'eSt' : undefined;

                        userModelHelper.getUsersForPage(pageNum, searchedName, sortOption).then(resp => {
                            expectation.tryCatchForPromise(resolve, reject, () => {
                                let correctUserNumber;
                                let _users = resp.users;

                                if (searchedName) {
                                    const regExp = new RegExp(searchedName, 'i');
                                    const filterBySearchedName = u => u.name.search(regExp) !== -1;

                                    correctUserNumber = allUsers.filter(filterBySearchedName).length;
                                    _users = _users.filter(filterBySearchedName);
                                }
                                else {
                                    correctUserNumber = allUsers.length;
                                }

                                assert.strictEqual(correctUserNumber, resp.count);
                                assert(_users);

                                pageNum = pageNum || 1;
                                const skippedItemNumber = (pageNum - 1) * ITEMS_PER_PAGE;
                                const expectedResultLength = Math.min(correctUserNumber - skippedItemNumber, ITEMS_PER_PAGE);
                                assert.strictEqual(_users.length, expectedResultLength);

                                const usersCopy = _users.slice(skippedItemNumber, skippedItemNumber + expectedResultLength);

                                if (sortEmailDirection) {
                                    usersCopy.sort((a, b) => sortEmailDirection === -1 ? a.email < b.email : a.email > b.email);
                                }

                                assert(usersCopy.every((u, i) => u.email === _users[i].email));
                            });
                        });
                    });
                }, 8, { name: 'THE BEST NAME' });

            }, 5, { name: 'THE WORST NAME' });
        };

        it('should return correct users according to all passed arguments', () => testGettingUsersForPage(2, true, -1));

        it('should return correct users in accordance with a page length without searching by text fields',
            () => testGettingUsersForPage(2, false, 1));

        it('should return correct users fit in with a page length without sorting the result',
            () => testGettingUsersForPage(1, true));

        it('should return correct users for a first page without any passed parameters', () => testGettingUsersForPage());

    });
});
