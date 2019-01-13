const getRandomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
};

const getRandomIntUpToMaxInteger = function () {
    return getRandomInt(Number.MAX_SAFE_INTEGER);
};

module.exports.getRandomIntUpToMaxInteger = getRandomIntUpToMaxInteger;

module.exports.getRandomIntUpToMaxAsString = function () {
    return '' + getRandomIntUpToMaxInteger();
};

module.exports.getRandomInt = getRandomInt;