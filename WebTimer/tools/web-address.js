const URL = require('url').URL;

function WebAddress(host, port) {
    const portValue = parseInt(port);
    const _port = Number.isNaN(portValue) ? 8080 : port;

    const _host = (host || '').toString();

    this.getPort = () => _port;

    this.getHost = () => _host;

    this.isInUse = () => _host.length > 0;

    this.useHttpsProtocol = () => _port.toString().endsWith('443');

    this.getFullUrl = () => {
        if (!this.isInUse())
            return '';

        const protocol = this.useHttpsProtocol() ? 'https' : 'http';
        return new URL(`${protocol}://${_host}:${_port}/#/`).toString();
    };
};

module.exports = WebAddress;
