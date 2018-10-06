const assert = require('assert');

const expectation = require('./infrastructure/expectation');
const randomiser = require('./infrastructure/randomiser');

describe('expectation', () => {

    describe('#tryCatchForPromise', () => {

        const testErrorCatching = (keyMessage, callback) => {
            return new Promise((resolve, reject) => {
                return new Promise((_resolve, _reject) => {
                    expectation.tryCatchForPromise(_reject, () => {
                        callback(_resolve, _reject);
                    });
                }).then(() => reject('The promise was considered to reject, but not to resolve'))
                    .catch(err => {
                        try {
                            assert(err);
                            assert.strictEqual(err.message, keyMessage.toString());

                            resolve();
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    });
            });
        };

        it('should catch an error and reject in a promise', () => {
            const keyMessage = randomiser.getRandomIntUpToMaxInteger();

            return testErrorCatching(keyMessage, () => {
                throw new Error(keyMessage);
            });
        });

        it('should catch an error and reject a promise inside an included try/catch block', () => {
            const keyMessage = randomiser.getRandomIntUpToMaxInteger();

            return testErrorCatching(keyMessage, (resolve, reject) => {
                expectation.tryCatchForPromise(reject, () => {
                    throw new Error(keyMessage);
                });
            });
        });

        it('should run a callback smoothly without throwing any errors in a promise', () => {

            return new Promise((resolve, reject) => {
                return new Promise((_resolve, _reject) => {
                    expectation.tryCatchForPromise(_reject, () => {
                        const keyMessage = randomiser.getRandomIntUpToMaxInteger();
                        assert(keyMessage);

                        _resolve();
                    });
                }).then(() => resolve()).catch(err => reject(err));
            });
        });

    });

    describe('#expectError', () => {

        it('should assert that an exception has been thrown', () =>
            expectation.expectError(() => { throw new Error(randomiser.getRandomIntUpToMaxInteger()); }));

        const testErrorExpectationWithException = (callback) => {
            try {
                expectation.expectError(callback);
            }
            catch (ex) {
                assert(ex);
                assert.strictEqual(ex.code, 'ERR_ASSERTION');
            }
        };

        it('should throw an exception since the passed callback will finish without errors', () =>
            testErrorExpectationWithException(() => randomiser.getRandomIntUpToMaxInteger()));

        it('should throw an exception since the passed callback is not a function', () =>
            testErrorExpectationWithException(randomiser.getRandomIntUpToMaxInteger()));
    });

    describe('#expectRejection', () => {

        it('should resolve the promise while getting an expected internal rejection', () => {
            return new Promise((resolve, reject) => {
                const keyMessage = randomiser.getRandomIntUpToMaxInteger().toString();

                return expectation.expectRejection(() => {

                    return new Promise((_resolve, _reject) => _reject(new Error(keyMessage)));
                }).then(err => {
                    try {
                        assert(err);
                        assert.strictEqual(err.message, keyMessage);

                        resolve();
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }).catch(err => reject(err));
            });
        });

        it('should reject the promise since it won\'t provoke any internal rejections', () => {
            return new Promise((resolve, reject) => {

                expectation.expectRejection(() => new Promise((_resolve, _reject) => _resolve()))
                    .then(() => reject(new Error('An error was expected to be thrown')))
                    .catch(ex => {
                        try {
                            assert(ex);
                            assert(ex.indexOf('error was expected') !== -1);

                            resolve();
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
            });
        });
    });

});