exports.ExpressApp = function () {
    const express = require('express');

    let initialisation = function() {
        let _app = express();

        const bodyParser = require('body-parser');
        _app.use(bodyParser.json());

        return _app;
    };

    let app = initialisation();
    
    this.initialisePassport = function () {
        const passport = require('passport');
        app.use(passport.initialize());
    };

    this.configureRoutes = function () {
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
    
    this.startHttpsServerListening = function (serverOptions) {
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
}

module.exports.connectToDb = function (uri) {
    const mongoose = require('mongoose');
    mongoose.connect(uri).then(resp => {
        console.log(`Connected to the ${resp.connection.db.databaseName} database`);
    });
};