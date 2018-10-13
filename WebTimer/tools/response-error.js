const config = require('../config');

exports.ResponseError = function (response) {
    if (!response)
        throw new Error('A required argument response is undefined');

    const logger = config.logger.startLogging('ResponseError');

    const formatAuthenticationErrorMsg = (msg) => `User is not logged in: ${msg}.`;

    const logWarn = (msg) => {
        logger.warn(msg);
        return msg;
    };

    const logError = (msg) => {
        logger.error(msg);
        return msg;
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
        response.end(logError(`An error while dealing with database: ${err.toString()}`));
    };

    this.respondWithUnexpectedError = function (err) {
        response.statusCode = 500;
        response.end(logError(`An unexpected error has happened: ${err.toString()}`));
    };
};
