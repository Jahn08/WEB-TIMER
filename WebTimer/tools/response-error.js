const config = require('../config');

function ResponseError(response) {
    if (!response)
        throw new Error('A required argument response is undefined');

    const logger = config.logger.startLogging('ResponseError');

    const formatAuthenticationErrorMsg = (msg) => `User is not logged in: ${msg}.`;

    const logWarn = (msg) => {
        logger.warn(msg);
        return msg;
    };

    const logError = (msg, err) => {
        const detailedErr = err.stack ? `reason: ${err.message}, stack: ${err.stack}`: 
            err.toString();
        logger.error(`${msg}: ${detailedErr}`);

        return `${msg}: ${err.toString()}`;
    };

    this.respondWithAuthenticationError = function (msg) {
        response.statusCode = 401;
        response.end(logWarn(formatAuthenticationErrorMsg(msg)));
    };

    this.respondWithUserIsNotFoundError = function () {
        response.statusCode = 404;
        response.end(logWarn(formatAuthenticationErrorMsg('user is not found')));
    };

    this.respondWithDatabaseError = function (err) {
        response.statusCode = 500;
        response.end(logError('An error while dealing with database', err));
    };

    this.respondWithUnexpectedError = function (err) {
        response.statusCode = 500;
        response.end(logError('An unexpected error has happened', err));
    };
}

ResponseError.catchAsyncError = function (fn) {
    return (req, res, next) => {
        const routePromise = fn(req, res, next);

        if (routePromise.catch)
            routePromise.catch(err => next(err));
    };
};

exports.ResponseError = ResponseError;
