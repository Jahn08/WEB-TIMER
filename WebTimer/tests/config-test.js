const assert = require('assert');

const config = require('../config');

describe('config.server', () => {
    const serverOptions = config.server;

    describe('#getFullUrl', () => {

        it('should return correct url for the application', () => {
            const url = serverOptions.getFullUrl();

            assert(url);

            const protocol = serverOptions.useHttpsProtocol() ? 'https' : 'http';
            assert.deepStrictEqual(url, `${protocol}://${serverOptions.host}:${serverOptions.port}/`);
        });
    });

    describe('#useHttpsProtocol', () => {

        it('should return an apt protocol version according to a port value in the config', () => {
            serverOptions.port = 55443;
            assert.deepStrictEqual(serverOptions.useHttpsProtocol(), true);

            serverOptions.port = 8080;
            assert.deepStrictEqual(serverOptions.useHttpsProtocol(), false);
        });
    });
});

