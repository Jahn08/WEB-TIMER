const startup = require('./startup');

let app = new startup.ExpressApp();
app.initialisePassport();
app.configureRoutes();

const config = require('./config');

app.startHttpsServerListening(config.server);

const dbConnection = new startup.DatabaseConnection();
dbConnection.connect(config.db.uri);