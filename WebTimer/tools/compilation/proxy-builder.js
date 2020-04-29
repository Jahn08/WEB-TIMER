const path = require('path');

class ProxyBuilder {
    constructor(port, rootPath) {
        this._targetUrl = `http://localhost:${port}/${rootPath}`;

        this.proxy = {};
    }

    addWithApiRewrite(ctrlName, apiMethod) {
        const proxyObj = this._createProxyObj();
        proxyObj.pathRewrite = {['/' + apiMethod] : `/${apiMethod}.json`};

        this.proxy[`/${ctrlName}/${apiMethod}`] = proxyObj;
        return this;
    }

    _createProxyObj() { return { target: this._targetUrl }; }

    add(...originalPaths) {
        this.proxy['/' + path.join(...originalPaths)] = this._createProxyObj();
        return this;
    }
}

module.exports = { ProxyBuilder };
