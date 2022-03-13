const fs = require('fs');
const path = require('path');

class SecretList {
    constructor(isProduction) {
        this._debugSecrets = isProduction ? null : this._loadDebugSecrets();
    }

    _loadDebugSecrets() {
        try {
            return JSON.parse(fs.readFileSync(path.join(__dirname, 'debug-secrets.json')));
        }
        catch (e) {
            return {};
        }
    }

    retrieve(name) {
        try {
            if (this._debugSecrets)
                return this._debugSecrets[name];

            return fs.readFileSync('/run/secrets/' + name, {
                encoding: 'utf8'
            }).trim();

        }
        catch (e) {
            return false;
        }
    }
}

const envs = process.env;
const isProduction = process.env.NODE_ENV === 'production';
const secretList = new SecretList(isProduction);

const getMongoHost = dbName => {
    const host = (secretList.retrieve('MONGO_HOST',) || envs.MONGO_HOST || 
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
            clientId: secretList.retrieve('AUTH_FACEBOOK_CLIENT_ID') || envs.AUTH_FACEBOOK_CLIENT_ID || 'FAKE',
            clientSecret: secretList.retrieve('AUTH_FACEBOOK_CLIENT_SECRET') || envs.AUTH_FACEBOOK_CLIENT_SECRET
        }
    },
    server: {
        pfx: {
            path: envs.SERVER_PFX_PATH || '1.pfx',
            password: secretList.retrieve('SERVER_PFX_PASSWORD') || envs.SERVER_PFX_PASSWORD
        },
        url: new WebAddress(envs.SERVER_HOST || '0.0.0.0', envs.SERVER_PORT || 3443, 
            parseBoolean(envs.SERVER_USE_HTTP)),
        externalUrl: new WebAddress(envs.SERVER_EXTERNAL_HOST, envs.SERVER_EXTERNAL_PORT,
            parseBoolean(envs.SERVER_EXTERNAL_USE_HTTP)),
        prerendererPort: 8000
    },
    mail: {
        host: secretList.retrieve('MAIL_HOST') || envs.MAIL_HOST,
        port: envs.MAIL_SECURE_PORT || 465,
        secure: true,
        auth: {
            user: secretList.retrieve('MAIL_AUTH_USER') || envs.MAIL_AUTH_USER,
            pass: secretList.retrieve('MAIL_AUTH_PASSWORD') || envs.MAIL_AUTH_PASSWORD
        }
    },
    about: {
        website: envs.ABOUT_WEBSITE
    },
    logger: new Logger(envs.LOGGER_LEVEL || 'error'), // warn, info
    isProduction: isProduction
};

module.exports = config;
