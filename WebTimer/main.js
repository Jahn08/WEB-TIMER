const startup = require('./startup');

const app = startup.initialiseExpressApp();
startup.initialisePassport(app);
startup.configureAppRoutes(app);

const config = require('./config');
startup.initialiseDbConnection(config.db.uri);
startup.startHttpsServerListening(app, config.server);