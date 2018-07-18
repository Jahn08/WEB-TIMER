exports.ResponseError = function (response) {
    if (!response)
        throw new Error('A required argument response is undefined');

    let formatAuthenticationErrorMsg = function (msg) {
        return `User is not logged in: ${msg}.`;
    };

    this.respondWithAuthenticationError = function (msg) {
        response.statusCode = 401;
        response.end(formatAuthenticationErrorMsg(msg));
    };

    this.respondWithUserIsNotFoundError = function () {
        response.statusCode = 404;
        response.end(formatAuthenticationErrorMsg('user is not found'));
    };

    this.respondWithDatabaseError = function (err) {
        response.statusCode = 500;
        response.end(`An error while dealing with database: ${err.toString()}`);
    };

    this.respondWithUnexpectedError = function (err) {
        response.statusCode = 500;
        response.end(`An unexpected error has happened: ${err.toString()}`);
    };
};
