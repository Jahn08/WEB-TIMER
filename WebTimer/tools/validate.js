const escapeHtml = require('escape-html');

module.exports = function validate(input) {
    if (Array.isArray(input))
        return input.map(validate);

    const inputType = typeof input;

    if (!input)
        return input;
        
    if (inputType === 'string')
        return escapeHtml(input);
    else if (inputType === 'object') {
        const output = {};

        Object.keys(input).forEach(k => output[k] = validate(input[k]));
        return output;
    }

    return input;
};
