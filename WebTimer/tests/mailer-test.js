const assert = require('assert');

const Mailer = require('../tools/mailer');

const mockedResponse = require('./infrastructure/mock').mockResponse();

const expectation = require('./infrastructure/expectation');

const getRandomIntUpToMaxInteger = require('./infrastructure/randomiser').getRandomIntUpToMaxInteger;
const getRandomIntUpToMaxIntegerAsString = () => getRandomIntUpToMaxInteger().toString();

const config = require('../config');

describe('Mailer', function () {
    this.timeout(5000);

    const sendMessage = (config, resolveCallback, methodForSending) => {
        const mailer = new Mailer(config, mockedResponse);

        const to = getRandomIntUpToMaxIntegerAsString();
        const name = getRandomIntUpToMaxIntegerAsString();

        return new Promise((resolve, reject) => {
            mailer[methodForSending](to, name)
                .then(msgData =>
                    expectation.tryCatchForPromise(reject, () => {
                        if (resolveCallback)
                            resolveCallback(to, name, msgData);

                        resolve(msgData);
                    }))
                .catch(err => reject(err));
        });
    };

    const sendMessageNowhere = (config, methodForSending) => {
        return sendMessage(config, (to, name, msgData) => {
            assert(msgData);

            assert.strictEqual(msgData.to, to);
            assert(msgData.html && msgData.html.indexOf(name) !== -1);
        }, methodForSending);
    };

    const sendMessageExpectingTransportError = (methodForSending) => {
        const mailOptions = config.mail;

        assert(mailOptions);
        mailOptions.host = getRandomIntUpToMaxIntegerAsString();

        assert(mailOptions.auth);
        mailOptions.auth.user = getRandomIntUpToMaxIntegerAsString();
        mailOptions.auth.pass = getRandomIntUpToMaxIntegerAsString();

        return new Promise((resolve, reject) => expectation.expectRejection(() => sendMessage(config, null, methodForSending))
            .then(outcome => expectation.tryCatchForPromise(reject, () => {
                assert(outcome);

                assert.strictEqual(outcome.code, 'ECONNECTION');
                assert.strictEqual(outcome.errno, 'ENOTFOUND');

                assert.strictEqual(outcome.host, mailOptions.host);

                resolve();
            })).catch(err => reject(err)));
    }; 

    const sendAccountCreationMsgMethodName = 'sendAccountCreationMsg';

    describe('#' + sendAccountCreationMsgMethodName, () => {

        it('should send no messages with an empty email host', () => {
            const mailOptions = config.mail;
            assert(mailOptions);

            mailOptions.host = null;

            return sendMessageNowhere(config, sendAccountCreationMsgMethodName);
        });

        it('should cause an error while sending the message about an account creation', () =>
            sendMessageExpectingTransportError(sendAccountCreationMsgMethodName));
    });

    const sendAccountRemovalMsgMethodName = 'sendAccountRemovalMsg';

    describe('#' + sendAccountRemovalMsgMethodName, () => {
        it('should send no messages with an empty sender login', () => {
            const mailOptions = config.mail;

            assert(mailOptions);
            assert(mailOptions.auth);

            mailOptions.auth.user = undefined;

            return sendMessageNowhere(config, sendAccountRemovalMsgMethodName);
        });

        it('should cause an error while sending the message about an account removal', () =>
            sendMessageExpectingTransportError(sendAccountRemovalMsgMethodName));
    });

    const sendAdminRoleSwitchMsgMethodName = 'sendAdminRoleSwitchMsg';

    describe('#' + sendAdminRoleSwitchMsgMethodName, () => {
        it('should send no messages with an empty sender password', () => {
            const mailOptions = config.mail;

            assert(mailOptions);
            assert(mailOptions.auth);

            mailOptions.auth.pass = '';

            return sendMessageNowhere(config, sendAdminRoleSwitchMsgMethodName);
        });

        it('should cause an error while sending the message about switching a user administrative role', () =>
            sendMessageExpectingTransportError(sendAdminRoleSwitchMsgMethodName));
    });
});
