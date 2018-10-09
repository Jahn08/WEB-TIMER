const assert = require('assert');

const process = require('process');

const randomiser = require('./infrastructure/randomiser');
const Logger = require('../tools/logger');

const StreamHooker = require('./infrastructure/stream-hooker');

describe('logger', () => {

    const infoTestedLevel = 'info';
    const warnTestedLevel = 'warn';
    const errorTestedLevel = 'error';

    const testLogging = (actualLogLevel, testedLogLevel, isExpected) => {
        const logger = new Logger(actualLogLevel);
        const key = randomiser.getRandomIntUpToMaxInteger().toString();

        const outputHooker = new StreamHooker(testedLogLevel === infoTestedLevel ? process.stdout : process.stderr);

        logger[testedLogLevel](key);

        const loggedMessages = outputHooker.endWriting();
        assert(loggedMessages);
        assert.strictEqual(loggedMessages.length, isExpected ? 1 : 0);

        if (isExpected) {
            const infoMsg = loggedMessages[0];
            assert(infoMsg.indexOf(testedLogLevel + ':') !== -1);
            assert(infoMsg.indexOf(key) !== -1);
        }
    };

    describe('#' + infoTestedLevel, () => {
        it('should log an information message', () => testLogging(infoTestedLevel, infoTestedLevel, true));

        it(`shouldn't log an information message for the warn level set`, () => testLogging(warnTestedLevel, infoTestedLevel, false));

        it(`shouldn't log an information message for the error level set`, () => testLogging(errorTestedLevel, infoTestedLevel, false));

        it(`should log no info messages for logging turned off`, () => testLogging(null, infoTestedLevel, false));
    });

    describe('#' + warnTestedLevel, () => {
        it('should log a warning message', () => testLogging(warnTestedLevel, warnTestedLevel, true));

        it(`should log a warning message for the information level set`, () => testLogging(infoTestedLevel, warnTestedLevel, true));

        it(`shouldn't log a warning message for the error level set`, () => testLogging(errorTestedLevel, warnTestedLevel, false));

        it(`should log no warn messages for logging turned off`, () => testLogging(null, warnTestedLevel, false));
    });

    describe('#' + errorTestedLevel, () => {
        it('should log an error message', () => testLogging(errorTestedLevel, errorTestedLevel, true));

        it(`should log an error message for the warn level set`, () => testLogging(warnTestedLevel, errorTestedLevel, true));

        it(`should log an error message for the information level set`, () => testLogging(infoTestedLevel, errorTestedLevel, true));

        it(`should log no error messages for logging turned off`, () => testLogging(null, errorTestedLevel, false));
    });

});
