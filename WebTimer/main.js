const express = require('express');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use('/components', express.static(__dirname + '/components'));
app.use(express.static(__dirname + '/views'));

const routerModule = require('./routes/modules');
app.use('/modules', routerModule);

const https = require('https');
const fs = require('fs');
const config = require('./config');

let server = https.createServer({
    pfx: fs.readFileSync(config.server.pfx.path),
    passphrase: config.server.pfx.password
}, app);

server.listen(config.server.port, config.server.host,
    () => console.log('Server listening on port ', config.server.port));