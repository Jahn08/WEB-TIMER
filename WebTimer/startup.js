const express = require('express');

exports.initialiseExpressApp = function () {
    let app = express();

    const bodyParser = require('body-parser');
    app.use(bodyParser.json());

    return app;
};

exports.initialisePassport = function (app) {
    const passport = require('passport');
    app.use(passport.initialize());
};

exports.configureAppRoutes = function (app) {
    app.use('/components', express.static(__dirname + '/components'));
    app.use(express.static(__dirname + '/views'));
    app.use('/resources', express.static(__dirname + '/resources'));

    const routerAuth = require('./routes/auth');
    app.use('/auth', routerAuth);

    const routerModule = require('./routes/modules');
    app.use('/modules', routerModule);

    const routerProgram = require('./routes/programs');
    app.use('/programs', routerProgram);
};

exports.initialiseDbConnection = function (uri) {
    const mongoose = require('mongoose');
    mongoose.connect(uri).then(resp => {
        console.log(`Connected to the ${resp.connection.db.databaseName} database`);
    });
};

exports.startHttpsServerListening = function (app, serverOptions) {
    const https = require('https');
    const fs = require('fs');

    const pfxConfig = serverOptions.pfx;

    let server = https.createServer({
        pfx: fs.readFileSync(pfxConfig.path),
        passphrase: pfxConfig.password
    }, app);

    server.listen(serverOptions.port, serverOptions.host,
        () => console.log('Server listening on port ', serverOptions.port));
};