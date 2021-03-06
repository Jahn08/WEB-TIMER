const assert = require('assert');
const ResponseError = require('../tools/response-error').ResponseError;

const randomiser = require('./infrastructure/randomiser');
const mock = require('./infrastructure/mock');
const expectation = require('./infrastructure/expectation');

describe('ResponseError', function () {
    const describeTestForWritingErrorMessage = function (methodName, httpCode) {
        describe(`#${methodName}`, function () {
            const response = mock.mockResponse();
            const responseError = new ResponseError(response);
            
            const invokeMethodByName = (obj, arg) => {
                const methodToInvoke = responseError[methodName];
                assert(methodToInvoke);

                methodToInvoke(arg);
            };

            const assertWritingErrorMessageAndCode = function () {
                const controlMsgId = randomiser.getRandomIntUpToMaxInteger();
                invokeMethodByName(methodName, controlMsgId);

                assert(response.statusCode == httpCode);
                assert(response.text && response.text.indexOf(controlMsgId) != -1,
                    `the response text is '${response.text}' and doesn't contain a passed message: '${controlMsgId}'`);
            };

            const assertWritingEmptyErrorMessageAndCode = function () {
                invokeMethodByName(responseError, methodName);

                assert(response.statusCode == httpCode,
                    `the response statusCode is ${response.statusCode} and not equal to required ${httpCode}`);
            };

            it(`should set a response statusCode to ${httpCode} and write a passed error message to the object`, function () {
                assertWritingErrorMessageAndCode();
            });

            it(`should set a response statusCode to ${httpCode} with an empty error message`, function () {
                assertWritingEmptyErrorMessageAndCode();
            });
        });
    };

    describeTestForWritingErrorMessage('respondWithAuthenticationError', 401);

    describeTestForWritingErrorMessage('respondWithDatabaseError', 500);

    describeTestForWritingErrorMessage('respondWithUnexpectedError', 500);

    describe('#respondWithUserIsNotFoundError', function () {
        it('should set a response statusCode to 404 and write a default message to the object', function () {
            const response = mock.mockResponse();

            const responseError = new ResponseError(response);
            responseError.respondWithUserIsNotFoundError();

            assert.ok(response.statusCode == 404 && response.text && response.text.length);
        });
    });

    it('should spark an error when trying to build the object without passing the response argument', () => {
        expectation.expectError(() => new ResponseError());
    });

    describe('#catchAsyncError', () => {
        const createRandomObj = () => {
            return { 
                id: randomiser.getRandomIntUpToMaxInteger() 
            };
        };

        const asyncMethod = (shouldReject = false) => new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldReject)
                    reject({ message: randomiser.getRandomIntUpToMaxAsString() });
                else
                    resolve();
            }, 1000);       
        });

        it('should pass all parameters to an async handler', () => {
            return new Promise((resolve, reject) =>
                expectation.tryCatchForPromise(reject, () => {
                    const reqObj = createRandomObj();
                    const respObj = createRandomObj();
                    
                    const respFn = ResponseError.catchAsyncError(async (req, res) => {
                        assert.deepStrictEqual(req, reqObj);
                        assert.deepStrictEqual(res, respObj);
    
                        await asyncMethod();
                        
                        resolve();
                    });        

                    respFn(reqObj, respObj, () => reject(new Error('The async method should\'ve finished without a rejection')));
                })
            );
        });

        it('should catch rejection and pass an error to a callback', () => {
            return new Promise((resolve, reject) =>
                expectation.tryCatchForPromise(reject, () => {
                    const respFn = ResponseError.catchAsyncError(async () => {
                        await asyncMethod(true);
      
                        reject(new Error('The async method should\'ve thrown exception not to turn up here'));
                    });        

                    respFn(createRandomObj(), createRandomObj(), (err) => {
                        assert(err);
                        assert(err.message);

                        resolve();
                    });
                })
            );
        });

    });

});
