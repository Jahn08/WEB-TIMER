module.exports.mockResponse = function () {
    return {
        end: function (msg) {
            this.text = msg;
        },
        statusCode: 0
    };
};