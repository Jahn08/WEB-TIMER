const path = require('path');

const FileSystem = require('./file-system').FileSystem;
const config = require('../../config');

const ProxyBuilder = require('./proxy-builder').ProxyBuilder;

class ApiMocker {
    constructor(buildPath) {
        this._buildPath = buildPath;

        this._MODULE_CTRL = 'modules';
        this._MODULE_ABOUT_METHOD = 'about';

        this._PROG_CTRL = 'programs';
        this._PROG_DEFAULT_METHOD = 'default';
        this._PROG_DEFAULT_SOUNDS_METHOD = 'defaultSounds';
    }
    
    configureProxy(port, buildDirName) {
        return new ProxyBuilder(port, buildDirName)
            .addWithApiRewrite(this._MODULE_CTRL, this._MODULE_ABOUT_METHOD)
            .addWithApiRewrite(this._PROG_CTRL, this._PROG_DEFAULT_METHOD)
            .addWithApiRewrite(this._PROG_CTRL, this._PROG_DEFAULT_SOUNDS_METHOD).proxy;
    }

    apply(compiler) {
        const pluginName = 'ApiMocker';

        const programsApiPath = path.join(this._buildPath, this._PROG_CTRL);
        const modulesApiPath = path.join(this._buildPath, this._MODULE_CTRL);

        compiler.hooks.entryOption.tap(pluginName, () => {
            FileSystem.writeObjToFile(path.join(modulesApiPath, this._MODULE_ABOUT_METHOD), {
                email: config.mail.auth.user,
                website: config.about.website
            });

            const defaultPrograms = require('../../models/default-program');
            FileSystem.writeObjToFile(path.join(programsApiPath, this._PROG_DEFAULT_METHOD), 
                defaultPrograms);

            const getDefaultSounds = require('../../models/default-sounds');
            FileSystem.writeObjToFile(path.join(programsApiPath, 
                this._PROG_DEFAULT_SOUNDS_METHOD), getDefaultSounds());
        });

        compiler.hooks.done.tap(pluginName, () => {
            FileSystem.removeDir(programsApiPath);
            FileSystem.removeDir(modulesApiPath);
        });
    }
}

module.exports = { ApiMocker };
