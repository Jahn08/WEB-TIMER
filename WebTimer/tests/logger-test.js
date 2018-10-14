const assert = require('assert');

const process = require('process');

const randomiser = require('./infrastructure/randomiser');
const Logger = require('../tools/logger');

const StreamHooker = require('./infrastructure/stream-hooker');

describe('logger', () => {

    const infoTestedLevel = 'info';
    const warnTestedLevel = 'warn';
    const errorTestedLevel = 'error';

    const useOutputHooker = (logLevel, onWritingCallback) => {
        const hooker = new StreamHooker(logLevel === infoTestedLevel ? process.stdout :
            process.stderr);

        let exception;

        try {
            onWritingCallback();
        }
        catch (ex) {
            exception = ex;
        }

        const loggedMessages = hooker.endWriting();

        if (exception)
            throw exception;

        return loggedMessages;
    };

    const testLogging = (actualLogLevel, testedLogLevel, isExpected) => {
        const logger = new Logger(actualLogLevel);
        const key = randomiser.getRandomIntUpToMaxInteger().toString();

        const loggedMessages = useOutputHooker(testedLogLevel, () => {
            const loggerContext = logger.startLogging('TestScope');
            loggerContext[testedLogLevel](key);
        });

        assert(loggedMessages);
        assert.strictEqual(loggedMessages.length, isExpected ? 1 : 0);

        if (isExpected) {
            const infoMsg = loggedMessages[0];
            assert(infoMsg.match(new RegExp(`${testedLogLevel}:`, 'i')).length, 1);
            assert(infoMsg.indexOf(key) !== -1);
        }
    };

    const testLoggingScopeName = (testedLogLevel) => {
        const logger = new Logger(testedLogLevel);
        const scopeKey = randomiser.getRandomIntUpToMaxInteger().toString();

        const loggedMessages = useOutputHooker(testedLogLevel, () => {
            const loggerContext = logger.startLogging(scopeKey);

            const key = randomiser.getRandomIntUpToMaxInteger().toString();
            loggerContext[testedLogLevel](key);
        });

        assert(loggedMessages);
        assert.strictEqual(loggedMessages.length, 1);
        
        const infoMsg = loggedMessages[0];
        assert(infoMsg.match(new RegExp(`${scopeKey}\.${arguments.callee.name}`)).length, 1);
    };

    describe('#' + infoTestedLevel, () => {
        it('should log an information message', () => testLogging(infoTestedLevel, infoTestedLevel, true));

        it(`shouldn't log an information message for the warn level set`, () => testLogging(warnTestedLevel, infoTestedLevel, false));

        it(`shouldn't log an information message for the error level set`, () => testLogging(errorTestedLevel, infoTestedLevel, false));

        it(`should log no info messages for logging turned off`, () => testLogging(null, infoTestedLevel, false));

        it(`should log an info message with the right scope name`, () => testLoggingScopeName(infoTestedLevel));
    });

    describe('#' + warnTestedLevel, () => {
        it('should log a warning message', () => testLogging(warnTestedLevel, warnTestedLevel, true));

        it(`should log a warning message for the information level set`, () => testLogging(infoTestedLevel, warnTestedLevel, true));

        it(`shouldn't log a warning message for the error level set`, () => testLogging(errorTestedLevel, warnTestedLevel, false));

        it(`should log no warning messages for logging turned off`, () => testLogging(null, warnTestedLevel, false));

        it(`should log a warning message with the right scope name`, () => testLoggingScopeName(warnTestedLevel));
    });

    describe('#' + errorTestedLevel, () => {
        it('should log an error message', () => testLogging(errorTestedLevel, errorTestedLevel, true));

        it(`should log an error message for the warn level set`, () => testLogging(warnTestedLevel, errorTestedLevel, true));

        it(`should log an error message for the information level set`, () => testLogging(infoTestedLevel, errorTestedLevel, true));

        it(`should log no error messages for logging turned off`, () => testLogging(null, errorTestedLevel, false));

        it(`should log an error message with the right scope name`, () => testLoggingScopeName(errorTestedLevel));
    });

    describe('#startLogging', () => {

        it('should log messages in different contexts', () => {
            const logger = new Logger(infoTestedLevel);

            const testMsg = 'test';

            const logForAnotherContext = (count) => {
                const contextKey = randomiser.getRandomIntUpToMaxInteger().toString();
                const loggerContext = logger.startLogging(contextKey);

                for (let i = 0; i < count; ++i)
                    loggerContext[infoTestedLevel](testMsg);

                return contextKey;
            };

            const outputHooker = new StreamHooker(process.stdout);

            const context1MsgCount = 2;
            const contextKey1 = logForAnotherContext(context1MsgCount);

            const context2MsgCount = 1;
            const contextKey2 = logForAnotherContext(context2MsgCount);

            const context3MsgCount = 2;
            const contextKey3 = logForAnotherContext(context3MsgCount);
            
            const loggedMessages = outputHooker.endWriting();
            
            assert(loggedMessages);
            assert.strictEqual(loggedMessages.length, context1MsgCount + context2MsgCount + context3MsgCount);

            const assertMessageCount = (key, count) => assert.strictEqual(loggedMessages.filter(m => m.indexOf(key) !== -1).length, count);

            assertMessageCount(contextKey1, context1MsgCount);
            assertMessageCount(contextKey2, context2MsgCount);
            assertMessageCount(contextKey3, context3MsgCount);
        });

    });

});
