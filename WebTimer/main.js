const startup = require('./startup');

const config = require('./config');
const app = new startup.ExpressApp(config.logger);
app.initialisePassport();
app.configureRoutes(config.server);

app.startHttpsServerListening(config.server);

const dbConnection = new startup.DatabaseConnection(config.logger);
dbConnection.connect(config.db.uri);