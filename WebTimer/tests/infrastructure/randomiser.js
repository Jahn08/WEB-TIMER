const getRandomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
};

module.exports.getRandomIntUpToMaxInteger = function () {
    return getRandomInt(Number.MAX_SAFE_INTEGER);
};

module.exports.getRandomInt = getRandomInt;