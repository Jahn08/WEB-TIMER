exports.ResponseError = function (response) {
    let formatAuthenticationErrorMsg = function (msg) {
        return `User is not logged in: ${msg}.`;
    };

    this.respondWithAuthenticationError = function (msg) {
        response.statusCode = 500;
        response.end(formatAuthenticationErrorMsg(msg));
    };

    this.respondWithUserIsNotFoundError = function () {
        response.statusCode = 404;
        response.end(formatAuthenticationErrorMsg('user is not found'));
    };
};
