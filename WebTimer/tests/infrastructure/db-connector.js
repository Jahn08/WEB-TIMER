module.exports.DbConnector = function () {
    const DatabaseConnection = require('../../startup').DatabaseConnection;
    const config = require('../../config');
    
    const dbConnection = new DatabaseConnection(config.logger);

    const testUri = config.db.testUri;
	
    this.connect = () => dbConnection.connect(testUri);
    
    this.disconnect = () => dbConnection.disconnect();
};