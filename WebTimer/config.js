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

const envs = process.env;

const getMongoHost = dbName => {
    const host = (getSecret('MONGO_HOST') || envs.MONGO_HOST || 
        'mongodb://localhost:27017/').trim();

    const uri = host.search(/\/$/, '') === -1 ? host + '/' : host;

    return `${uri}${dbName}?retryWrites=true&w=majority`;
};

const Logger = require('./tools/logger');

const WebAddress = require('./tools/web-address');

const parseBoolean = val => {
    try {
        val = JSON.parse((val || '').toLowerCase());

        if (Number.isInteger(val))
            return val !== 0;
                    
        return val === true;
    }
    catch(err) {
        return false;
    }
};

const config = {
    db: {
        uri: getMongoHost('WebTimerDb'),
        testUri: getMongoHost('TestDb')
    },
    auth: {
        facebook: {
            clientId: getSecret('AUTH_FACEBOOK_CLIENT_ID') || envs.AUTH_FACEBOOK_CLIENT_ID,
            clientSecret: getSecret('AUTH_FACEBOOK_CLIENT_SECRET') || envs.AUTH_FACEBOOK_CLIENT_SECRET
        }
    },
    server: {
        pfx: {
            path: envs.SERVER_PFX_PATH || '1.pfx',
            password: getSecret('SERVER_PFX_PASSWORD') || envs.SERVER_PFX_PASSWORD
        },
        url: new WebAddress(envs.SERVER_HOST || '0.0.0.0', envs.SERVER_PORT || 3443, 
            parseBoolean(envs.SERVER_USE_HTTP)),
        externalUrl: new WebAddress(envs.SERVER_EXTERNAL_HOST, envs.SERVER_EXTERNAL_PORT,
            parseBoolean(envs.SERVER_EXTERNAL_USE_HTTP))
    },
    mail: {
        host: envs.MAIL_HOST,
        port: envs.MAIL_SECURE_PORT || 465,
        secure: true,
        auth: {
            user: envs.MAIL_AUTH_USER,
            pass: getSecret('MAIL_AUTH_PASSWORD') || envs.MAIL_AUTH_PASSWORD
        }
    },
    about: {
        website: envs.ABOUT_WEBSITE
    },
    logger: new Logger(envs.LOGGER_LEVEL || 'error') // warn, info
};

module.exports = config;
