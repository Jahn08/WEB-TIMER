const path = require('path');
const FileSystem = require('./file-system').FileSystem;

const ProxyBuilder = require('./proxy-builder').ProxyBuilder;

class DependencyCopier {
    constructor(buildPath, rootPath, forProduction) {
        this._rootPath = rootPath;
        this._forProd = forProduction;

        this._EXTERNALS_DIR_NAME = 'externals';
        this._externalsPath = path.join(buildPath, this._EXTERNALS_DIR_NAME);
    }

    configureProxy(port, buildDirName) {
        return new ProxyBuilder(port, buildDirName)
            .add(this._EXTERNALS_DIR_NAME).add('app.js').proxy;
    }

    apply(compiler) {
        compiler.hooks.entryOption.tap('DependencyCopier', 
            () => this._copyExternals());
    }

    _copyExternals() {
        FileSystem.createDir(this._externalsPath);

        const modulesPath = path.join(this._rootPath, 'node_modules');
        const bootstrapDist = path.join(modulesPath, 'bootstrap', 'dist');
        FileSystem.copyFiles(this._externalsPath, 
            path.join(modulesPath, 'jquery', 'dist', 'jquery.slim.min.js'),
            path.join(bootstrapDist, 'js', 'bootstrap.min.js'),
            path.join(bootstrapDist, 'css', 'bootstrap.min.css'),
            path.join(modulesPath, 'vue-router', 'dist', 'vue-router.min.js'));

        const vuePath = path.join(modulesPath, 'vue', 'dist', 
            `vue${this._forProd ? '.min' : ''}.js`);
        FileSystem.copyFile(vuePath, this._externalsPath, 'vue.js');
    }
}

module.exports = { DependencyCopier };
