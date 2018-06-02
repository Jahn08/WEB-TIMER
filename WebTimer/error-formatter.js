let formatAuthenticationErrorMsg = function (msg) {
    return `User is not logged in: ${msg}.`;
};

module.exports.respondWithAuthenticationError = function (response, msg) {
    response.statusCode = 500;
    response.end(formatAuthenticationErrorMsg(msg));
};

module.exports.respondWithUserIsNotFoundError = function (response) {
    response.statusCode = 404;
    response.end(formatAuthenticationErrorMsg('user is not found'));
};