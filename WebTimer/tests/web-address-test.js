const assert = require('assert');

const URL = require('url').URL;

const WebAddress = require('../tools/web-address');
const getRandomInt = require('./infrastructure/randomiser').getRandomInt;

describe('WebAddress', () => {
    const defaultHost = '0.0.0.0';
    const maxPortValue = 9999;

    describe('#getHost', () => {
        it('should return a host value passed as an argument', () => {
            const host = getRandomInt(maxPortValue).toString();
            const address = new WebAddress(host);
            assert.deepStrictEqual(address.getHost(), host);
        });
    });

    describe('#getPort', () => {
        it('should return a port value passed as an argument', () => {
            const port = getRandomInt(maxPortValue);
            const address = new WebAddress(null, port);
            assert.deepStrictEqual(address.getPort(), port);
        });

        it('should return a default port value with the empty argument', () => {
            const address = new WebAddress(defaultHost);
            assert.deepStrictEqual(address.getPort(), 443);
        });

        it('should return a default port value with the incorrect argument', () => {
            const address = new WebAddress(defaultHost, 'test');
            assert.deepStrictEqual(address.getPort(), 443);
        });
    });

    describe('#getFullUrl', () => {

        it('should return correct url for the application', () => {
            const address = new WebAddress(defaultHost, getRandomInt(maxPortValue));
            const url = address.getFullUrl();

            assert(url);

            const protocol = address.useHttpsProtocol() ? 'https' : 'http';
            assert.deepStrictEqual(url, new URL(`${protocol}://${address.getHost()}:${address.getPort()}/#/`).toString());
        });

        it('should return an empty url for a null port and host', () => {
            const address = new WebAddress();
            assert.deepStrictEqual(address.getFullUrl(), '');
        });
    });
    
    describe('#isInUse', () => {
        it('should indicate that the address is in use since its port and host are filled correctly', () => {
            const address = new WebAddress(defaultHost, getRandomInt(maxPortValue));
            assert.deepStrictEqual(address.isInUse(), true);
        });

        it('should indicate that the address is not in use since its port and host are null', () => {
            const address = new WebAddress();
            assert.deepStrictEqual(address.isInUse(), false);
        });
    });

    describe('#useHttpsProtocol', () => {

        it('should show the usage of the https protocol by default', () => {
            const address = new WebAddress(defaultHost, 55444);
            assert.deepStrictEqual(address.useHttpsProtocol(), true);
        });

        it('shouldn\'t show the usage of the https protocol', () => {
            const address = new WebAddress(defaultHost, 8080, true);
            assert.deepStrictEqual(address.useHttpsProtocol(), false);
        });
    });
});
