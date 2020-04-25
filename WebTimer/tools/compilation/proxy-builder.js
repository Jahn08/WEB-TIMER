const path = require('path');

class ProxyBuilder {
    constructor(port, rootPath) {
        this._targetUrl = `http://localhost:${port}/${rootPath}`;

        this.proxy = {};
    }

    addWithApiRewrite(ctrlName, apiMethod) {
        this.proxy[`/${ctrlName}/${apiMethod}`] = {
            target: this._targetUrl,
            pathRewrite: {['/' + apiMethod] : `/${apiMethod}.json`}
        };

        return this;
    }

    add(...originalPaths) {
        this.proxy['/' + path.join(...originalPaths)] = {
            target: this._targetUrl
        };

        return this;
    }
}

module.exports = { ProxyBuilder };
