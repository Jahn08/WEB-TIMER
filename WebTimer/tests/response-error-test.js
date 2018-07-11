const assert = require('assert');
const ResponseError = require('../tools/response-error').ResponseError;

const randomiser = require('./infrastructure/randomiser');
const mock = require('./infrastructure/mock');

describe('ResponseError', function () {
    const describeTestForWritingErrorMessage = function (methodName, httpCode) {
        describe(`#${methodName}`, function () {
            let response = mock.mockResponse();
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
            let response = mock.mockResponse();

            const responseError = new ResponseError(response);
            responseError.respondWithUserIsNotFoundError();

            assert.ok(response.statusCode == 404 && response.text && response.text.length);
        });
    });
});