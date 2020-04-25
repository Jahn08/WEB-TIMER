const FileSystem = require('../file-system').FileSystem;

class BuildCleaner {
    constructor(buildPath) {
        this._buildPath = buildPath;        
    }

    apply(compiler) {
        compiler.hooks.entryOption.tap('BuildCleaner', 
            () => FileSystem.cleanDir(this._buildPath));
    }
}

module.exports = { BuildCleaner };
