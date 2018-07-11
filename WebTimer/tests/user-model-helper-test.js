const assert = require('assert');

const DbConnector = function (testsShouldBeRun) {
    let testsWereRun = 0;

    const DatabaseConnection = require('../startup').DatabaseConnection;
    const dbConnection = new DatabaseConnection();

    const testUri = require('../config').db.testUri;
    dbConnection.connect(testUri);
    
    this.increaseRunTestNumber = function () {
        testsWereRun++;
    };

    const interval = setInterval(() => {
        if (testsWereRun === testsShouldBeRun) {
            dbConnection.disconnect();
            clearInterval(interval);
        }
    }, 1000);
};

const testsOverall = 8;
const dbConnector = new DbConnector(testsOverall);

const User = require('../models/user');
const UserModelHelper = require('../tools/db-model-helpers').UserModelHelper;

const randomiser = require('./infrastructure/randomiser');
const mock = require('./infrastructure/mock');

describe('UserModelHelper', function () {
    this.timeout(3000);

    const getString = (obj) => obj ? obj.toString() : '';
    
    const usingTestUser = function (callback) {
        const testStr = 'TEST';
        const facebookId = randomiser.getRandomIntUpToMaxInteger();

        const newUser = new User({
            userName: testStr,
            firstName: testStr,
            lastName: testStr,
            email: testStr,
            administrator: false,
            facebookId
        });

        return new Promise((resolve, reject) => {
            newUser.save((err, user) => {
                assert(!err, 'An error while creating a test user: ' + getString(err));
                assert.equal(user.facebookId, facebookId);

                const removeUserAndFinish = respErr => user.remove(err => {
                    assert(!err, 'An error while removing a test user: ' + getString(err));
                    dbConnector.increaseRunTestNumber();

                    if (respErr)
                        reject(respErr);
                    else
                        resolve();
                });

                callback(facebookId)
                    .then(removeUserAndFinish)
                    .catch(removeUserAndFinish);
            });
        });
    };
    
    const useFindingUserMethodWithoutError = (methodToInvoke, useResponse) => {
        const testCallback = (facebookId) => {

            return new Promise((resolve, reject) => {
                const userModelHelper = new UserModelHelper(User);

                let response;

                if (useResponse) {
                    response = mock.mockResponse();
                    userModelHelper.setReponse(response);
                }

                const invokeMethodByName = (methodName, arg) => {
                    const methodToInvoke = userModelHelper[methodName];
                    assert(methodToInvoke);

                    return methodToInvoke(arg);
                };

                invokeMethodByName(methodToInvoke, facebookId).then(foundUser => {
                    assert(foundUser);
                    assert.equal(foundUser.facebookId, facebookId);

                    if (useResponse)
                        assert(!response.text);

                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        };

        return usingTestUser(testCallback);
    };

    const findUserMethodName = 'findUser';

    describe('#' + findUserMethodName, () => {
        it('should find an existent user in a database without an error in a response', () => {
            return useFindingUserMethodWithoutError(findUserMethodName, true);
        });

        it('should reject and write an error message to a response while trying to find a non existent user in a database', () => {
            const facebookId = randomiser.getRandomIntUpToMaxInteger();
            const userModelHelper = new UserModelHelper(User);

            const response = mock.mockResponse();
            userModelHelper.setReponse(response);
            
            return new Promise((resolve, reject) => {
                userModelHelper.findUser(facebookId).then(foundUser => {
                    dbConnector.increaseRunTestNumber();
                    reject(`The program shouldn't have been here, since the user with facebookId=${facebookId} is not supposed to exist`);
                }).catch(err => {
                    dbConnector.increaseRunTestNumber();

                    try {
                        assert(err);
                        assert(response.text && response.statusCode === 404);

                        resolve();
                    }
                    catch (ex) {
                        reject(ex);
                    }
                });
            });            
        });

        it('should find an existent user in a database without using a response object', () => {
            return useFindingUserMethodWithoutError(findUserMethodName, false);
        });

        it('should reject without using a response object', () => {
            const facebookId = randomiser.getRandomIntUpToMaxInteger();
            const userModelHelper = new UserModelHelper(User);
            
            return new Promise((resolve, reject) => {
                userModelHelper.findUser(facebookId).then(foundUser => {
                    dbConnector.increaseRunTestNumber();
                    reject(`The program shouldn't have been here, since the user with facebookId=${facebookId} is not supposed to exist`);
                }).catch(err => {
                    dbConnector.increaseRunTestNumber();

                    try {
                        assert(err);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
        });
    });

    const findUserOrEmptyMethodName = 'findUserOrEmpty';

    describe('#' + findUserOrEmptyMethodName, () => {
        it('should find an existent user in a database without an error in a response', () => {
            return useFindingUserMethodWithoutError(findUserOrEmptyMethodName, true);
        });

        it('should return an empty user without rejecting and an error in a response', () => {
            const facebookId = randomiser.getRandomIntUpToMaxInteger();
            const userModelHelper = new UserModelHelper(User);

            const response = mock.mockResponse();
            userModelHelper.setReponse(response);

            return new Promise((resolve, reject) => {
                userModelHelper.findUserOrEmpty(facebookId).then(foundUser => {
                    dbConnector.increaseRunTestNumber();

                    try {
                        assert(!foundUser);
                        assert(!response.text && !response.statusCode);

                        resolve();
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }).catch(err => {
                    dbConnector.increaseRunTestNumber();
                    reject(err);
                });
            });
        });

        it('should find an existent user in a database without using a response object', () => {
            return useFindingUserMethodWithoutError(findUserOrEmptyMethodName, false);
        });

        it('should return an empty user without using a response object', () => {
            const facebookId = randomiser.getRandomIntUpToMaxInteger();
            const userModelHelper = new UserModelHelper(User);

            return new Promise((resolve, reject) => {
                userModelHelper.findUserOrEmpty(facebookId).then(foundUser => {
                    dbConnector.increaseRunTestNumber();

                    try {
                        assert(!foundUser);
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                }).catch(err => {
                    dbConnector.increaseRunTestNumber();
                    reject(err);
                });
            });
        });

    });
});
