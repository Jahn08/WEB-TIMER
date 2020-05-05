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

    const path = require('path');
    const fs = require('fs');

    const configureViewHandlers = function(serverOptions) {
        const clientDirName = 'client';
        const viewsDirName = 'views';

        const prerenderedViewPath = path.join(__dirname, clientDirName, viewsDirName);
        const prerenderedViews = [];
        let defaultPath;

        if (!fs.existsSync(prerenderedViewPath))
            return;
        
        const WebAddress = require('./tools/web-address');
        const prerenderedUrl = new WebAddress('localhost', serverOptions.prerendererPort, true)
            .getFullUrl(true).slice(0, -1);
        const prerenderedUrlRegex = new RegExp(prerenderedUrl, 'g');

        const actualUrl = (serverOptions.externalUrl.isInUse() ? serverOptions.externalUrl : 
            serverOptions.url).getFullUrl().slice(0, -1);

        fs.readdirSync(prerenderedViewPath).forEach(p  => {
            const fullPath = path.join(prerenderedViewPath, p);

            const viewPath = '/' + p;
            if (fs.statSync(fullPath).isDirectory())
                prerenderedViews.push(viewPath);

            fs.readdirSync(fullPath).forEach(fp => {
                const filePath = path.join(fullPath, fp);
                const fileContent = fs.readFileSync(filePath);

                if (!defaultPath && fileContent.indexOf('canonical') !== -1)
                    defaultPath = viewPath;
                
                if (fileContent.indexOf(prerenderedUrl) !== -1)
                    fs.writeFileSync(filePath, 
                        fileContent.toString().replace(prerenderedUrlRegex, actualUrl));
            });
        });

        app.use((req, res, next) => {
            const accept = req.headers.accept || '';

            if (['GET', 'HEAD'].includes(req.method) && req.path.indexOf('.') === -1 &&
                (!accept || ['text/html', '*/*'].some(a => accept.indexOf(a) !== -1))) {
                let prefix = '';
                
                if (prerenderedViews.includes(req.path))
                    prefix = path.join(viewsDirName, req.path);
                else if (defaultPath && req.path === '/')
                    prefix = path.join(viewsDirName, defaultPath);

                req.url = prefix + '/index.html';
            }

            next();
        });

        app.use('/', express.static(path.join(__dirname, clientDirName)), 
            express.static(path.join(__dirname, viewsDirName)));
    };

    this.configureRoutes = function (serverOptions) {		
        app.set('trust proxy', true);

        app.use(function (req, res, next) {
            const host = req.headers.host;
            if (host.slice(0, 4) === 'www.')
                return res.redirect(301, `${req.protocol}://${host.slice(4)}${req.originalUrl}`);
            
            next();
        });

        app.use('/resources', express.static(path.join(__dirname, 'resources')));
        app.use('/', express.static(path.join(__dirname, 'seo')));

        const routerAuth = require('./routes/auth');
        app.use('/auth', routerAuth);

        const routerModule = require('./routes/modules');
        app.use('/modules', routerModule);

        const routerProgram = require('./routes/programs');
        app.use('/programs', routerProgram);

        const routerUser = require('./routes/users');
        app.use('/users', routerUser);

        configureViewHandlers(serverOptions);

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
