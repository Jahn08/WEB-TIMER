const URL = require('url').URL;

const fs = require('fs');

const getSecret = (name) => {
    try {
        return fs.readFileSync('/run/secrets/' + name, {
            encoding: 'utf8'
        }).trim();
    }
    catch (e) {
        return false;
    }
};

const getMongoHost = () => {
    const host = process.env.MONGO_HOST || 'mongodb://localhost:27017/';
    return host && host.search(/\/$/, '') === -1 ? host + '/' : host;
};

const Logger = require('./tools/logger');

module.exports = {
    db: {
        uri: getMongoHost() + 'WebTimer',
        testUri: getMongoHost() + 'TestDb'
    },
    auth: {
        facebook: {
            clientId: getSecret('AUTH_FACEBOOK_CLIENT_ID') || process.env.AUTH_FACEBOOK_CLIENT_ID,
            clientSecret: getSecret('AUTH_FACEBOOK_CLIENT_SECRET') || process.env.AUTH_FACEBOOK_CLIENT_SECRET
        }
    },
    server: {
        pfx: {
            path: process.env.SERVER_PFX_PATH || '1.pfx',
            password: getSecret('SERVER_PFX_PASSWORD') || process.env.SERVER_PFX_PASSWORD
        },
        port: process.env.SERVER_PORT || 3443,
        host: process.env.SERVER_HOST || '0.0.0.0',
        getFullUrl: function () {
            const protocol = this.useHttpsProtocol() ? 'https' : 'http';

            const url = new URL(`${protocol}://${this.host}:${this.port}`);
            return url.toString();
        },
        useHttpsProtocol: function () {
            return this.port ? this.port.toString().endsWith('443') : false;
        }
    },
    mail: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_SECURE_PORT || 465,
        secure: true,
        auth: {
            user: process.env.MAIL_AUTH_USER,
            pass: getSecret('MAIL_AUTH_PASSWORD') || process.env.MAIL_AUTH_PASSWORD
        }
    },
    about: {
        website: process.env.ABOUT_WEBSITE
    },
    logger: new Logger(process.env.LOGGER_LEVEL || 'error') // warn, info
};