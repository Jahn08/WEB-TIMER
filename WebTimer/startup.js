exports.ExpressApp = function (logger) {
    const loggerContext = logger.startLogging('ExpressApp');

    const express = require('express');

    const initialisation = function() {
        const _app = express();

        const bodyParser = require('body-parser');
        _app.use(bodyParser.json());

        const helmet = require('helmet');
        _app.use(helmet());

        return _app;
    };

    const app = initialisation();

    this.initialisePassport = function () {
        const passport = require('passport');
        app.use(passport.initialize());
    };

    this.configureRoutes = function () {		
        app.set('trust proxy', true);

        app.use(function (req, res, next) {
            const host = req.headers.host;
            if (host.slice(0, 4) === 'www.')
                return res.redirect(301, `${req.protocol}://${host.slice(4)}${req.originalUrl}`);
            
            next();
        });

        const history = require('connect-history-api-fallback');
        app.use(history({
            htmlAcceptHeaders: ['text/html']
        }));

        app.use('/components', express.static(__dirname + '/components'));
        app.use(express.static(__dirname + '/views'));
        app.use('/resources', express.static(__dirname + '/resources'));
        app.use('/', express.static(__dirname + '/seo'));

        const routerAuth = require('./routes/auth');
        app.use('/auth', routerAuth);

        const routerModule = require('./routes/modules');
        app.use('/modules', routerModule);

        const routerProgram = require('./routes/programs');
        app.use('/programs', routerProgram);

        const routerUser = require('./routes/users');
        app.use('/users', routerUser);

        const ResponseError = require('./tools/response-error').ResponseError;

        // eslint-disable-next-line no-unused-vars
        app.use((err, req, res, next) => {			
            if (err) {
                const respErr = new ResponseError(res);
                respErr.respondWithUnexpectedError(err);
            }
        });
    };
    
    this.startHttpsServerListening = function (serverOptions) {
        const https = require('https');
        const http = require('http');

        const fs = require('fs');
    
        const pfxConfig = serverOptions.pfx;

        const url = serverOptions.url;
        const server = url.useHttpsProtocol() ? https.createServer({
            pfx: fs.readFileSync(pfxConfig.path),
            passphrase: pfxConfig.password
        }, app) : http.createServer(app);

        const port = url.getPort();
        const host = url.getHost();
        server.listen(port, host,() => loggerContext.info(`Server listening on ${host}:${port}`));
    
        process.on('uncaughtException', err => {
            loggerContext.error(`Unexpected error: ${err}`);
    
            server.close(() => process.exit(1)); 
        });
    };
};

module.exports.DatabaseConnection = function (logger) {
    const loggerContext = logger.startLogging('DatabaseConnection');

    const mongoose = require('mongoose');
    
    this.connect = function (uri) {
        return mongoose.connect(uri, { useNewUrlParser: true })
            .then(resp => loggerContext.info(`Connected to the ${resp.connection.db.databaseName} database`))
            .catch(reason => loggerContext.info(`Unable to connect to the server ${uri} due to the reason: ${reason}`));
    };

    this.disconnect = function () {
        return mongoose.disconnect()
            .then(() => loggerContext.info('All connections have been disconnected'))
            .catch(reason => loggerContext.info(`Unable to disconnect all connections due to the reason: ${reason}`));
    };
};
