const path = require('path');

const FileSystem = require('./file-system').FileSystem;
const config = require('../../config');

const ProxyBuilder = require('./proxy-builder').ProxyBuilder;

class ApiMocker {
    constructor(buildPath) {
        this._buildPath = buildPath;

        this._MODULE_CTRL = 'modules';
        this._MODULE_ABOUT_METHOD = 'about';
    }
    
    configureProxy(port, buildDirName) {
        return new ProxyBuilder(port, buildDirName)
            .addWithApiRewrite(this._MODULE_CTRL, this._MODULE_ABOUT_METHOD).proxy;
    }

    apply(compiler) {
        const pluginName = 'ApiMocker';

        const modulesApiPath = path.join(this._buildPath, this._MODULE_CTRL);

        compiler.hooks.entryOption.tap(pluginName, () => {
            FileSystem.writeObjToFile(path.join(modulesApiPath, this._MODULE_ABOUT_METHOD), {
                email: config.mail.auth.user,
                website: config.about.website
            });
        });

        compiler.hooks.done.tap(pluginName, () => {
            FileSystem.removeDir(modulesApiPath);
        });
    }
}

module.exports = { ApiMocker };
