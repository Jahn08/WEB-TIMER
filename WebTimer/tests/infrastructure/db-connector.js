module.exports.DbConnector = function () {
    const DatabaseConnection = require('../../startup').DatabaseConnection;
    const dbConnection = new DatabaseConnection();

    const testUri = require('../../config').db.testUri;
    dbConnection.connect(testUri);

    this.disconnect = () => {
        dbConnection.disconnect();
    }
};