const assert = require('assert');

const User = require('../models/user');
const UserModelHelper = require('../tools/db-model-helpers').UserModelHelper;

const randomiser = require('./infrastructure/randomiser');
const mock = require('./infrastructure/mock');
const expectation = require('./infrastructure/expectation');

describe('UserModelHelper', function () {
    let dbConnector;

    before(() => {
        const DbConnector = require('./infrastructure/db-connector').DbConnector;
        dbConnector = new DbConnector();
    });

    after(() => dbConnector.disconnect());

    this.timeout(3000);

    const getString = (obj) => obj ? obj.toString() : '';
    
    const usingTestUser = function (callback) {
        const testStr = 'TEST';
        const facebookId = randomiser.getRandomIntUpToMaxInteger();

        const newUser = new User({
            name: testStr,
            firstName: testStr,
            lastName: testStr,
            email: testStr,
            administrator: false,
            facebookId
        });

        return new Promise((resolve, reject) => {
            newUser.save((err, user) => {
                assert(!err, 'An error while creating a test user: ' + getString(err));
                assert.strictEqual(user.facebookId, facebookId.toString());

                const removeUserAndFinish = respErr => user.remove(err => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(!err, 'An error while removing a test user: ' + getString(err));

                        if (respErr)
                            throw new Error(respErr.toString());
                    });
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
                const userModelHelper = new UserModelHelper();

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
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(foundUser);
                        assert.strictEqual(foundUser.facebookId, facebookId.toString());

                        if (useResponse)
                            assert(!response.text);
                    });
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
            const userModelHelper = new UserModelHelper();

            const response = mock.mockResponse();
            userModelHelper.setReponse(response);

            return expectation.expectRejection(() => userModelHelper.findUser(facebookId),
                () => assert(response.text && response.statusCode === 404));
        });

        it('should find an existent user in a database without using a response object', () => {
            return useFindingUserMethodWithoutError(findUserMethodName, false);
        });

        it('should reject without using a response object', () => {
            const facebookId = randomiser.getRandomIntUpToMaxInteger();
            const userModelHelper = new UserModelHelper();
            
            return expectation.expectRejection(() => userModelHelper.findUser(facebookId));
        });
    });

    const findUserOrEmptyMethodName = 'findUserOrEmpty';

    describe('#' + findUserOrEmptyMethodName, () => {
        it('should find an existent user in a database without an error in a response', () => {
            return useFindingUserMethodWithoutError(findUserOrEmptyMethodName, true);
        });

        it('should return an empty user without rejecting and an error in a response', () => {
            const facebookId = randomiser.getRandomIntUpToMaxInteger();
            const userModelHelper = new UserModelHelper();

            const response = mock.mockResponse();
            userModelHelper.setReponse(response);

            return new Promise((resolve, reject) => {
                userModelHelper.findUserOrEmpty(facebookId).then(foundUser => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(!foundUser);
                        assert(!response.text && !response.statusCode);
                    });
                }).catch(err => reject(err));
            });
        });

        it('should find an existent user in a database without using a response object', () => {
            return useFindingUserMethodWithoutError(findUserOrEmptyMethodName, false);
        });

        it('should return an empty user without using a response object', () => {
            const facebookId = randomiser.getRandomIntUpToMaxInteger();
            const userModelHelper = new UserModelHelper();

            return new Promise((resolve, reject) => {
                userModelHelper.findUserOrEmpty(facebookId).then(foundUser =>
                    expectation.tryCatchForPromise(resolve, reject, () => assert(!foundUser)))
                    .catch(err => reject(err));
            });
        });
    });

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

});
