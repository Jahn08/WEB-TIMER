const assert = require('assert');
const ResponseError = require('../response-error').ResponseError;

const randomiser = require('./infrastructure/randomiser');

let mockResponse = function () {
    return {
        end: function (msg) {
            this.text = msg;
        },
        statusCode: 0
    };
};

describe('ResponseError', function () {
    describe('#respondWithAuthenticationError', function () {
        it('should set a response statusCode to 500 and write a passed error message to the object', function () {
            let response = mockResponse();
            const responseError = new ResponseError(response);

            const controlMsgId = randomiser.getRandomInt(Number.MAX_SAFE_INTEGER);
            responseError.respondWithAuthenticationError(controlMsgId);

            assert(response.statusCode == 500);
            assert(response.text && response.text.indexOf(controlMsgId) != -1);
        });

        it('should set a response statusCode to 500 with an empty error message', function () {
            let response = mockResponse();

            const responseError = new ResponseError(response);
            responseError.respondWithAuthenticationError();
            
            assert(response.statusCode == 500);
        });
    });

    describe('#respondWithUserIsNotFoundError', function () {
        it('should set a response statusCode to 404 and write a default message to the object', function () {
            let response = mockResponse();

            const responseError = new ResponseError(response);
            responseError.respondWithUserIsNotFoundError();

            assert(response.statusCode == 404);
        });
    });
});