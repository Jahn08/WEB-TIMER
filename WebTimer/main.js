const startup = require('./startup');

let app = new startup.ExpressApp();
app.initialisePassport();
app.configureRoutes();

const config = require('./config');

app.startHttpsServerListening(config.server);

startup.connectToDb(config.db.uri);