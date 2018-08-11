const URL = require('url').URL;

module.exports = {
    db: {
        uri: 'mongodb://localhost:27017/WebTimer',
        testUri: 'mongodb://localhost:27017/TestDb'
    },
    auth: {
        facebook: {
            clientId: '',
            clientSecret: ''
        }
    },
    server: {
        pfx: {
            path: '',
            password: ''
        },
        port: 3443,
        host: 'localhost',
        getFullUrl: function () {
            const protocol = this.useHttpsProtocol() ? 'https' : 'http';

            const url = new URL(`${protocol}://${this.host}:${this.port}`);
            return url.toString();
        },
        useHttpsProtocol: function () {
            return this.port.toString().endsWith('443');
        }
    },
    mail: {
        service: 'mail',
        auth: {
            user: '',
            pass: ''
        }
    }
};