const path = require('path');
const fs = require('fs');

class FileSystem {
    static removeDir(dirPath) {
        this._cleanDir(dirPath, true);
    }

    static _cleanDir(dirPath, removeItself) {
        if (!fs.existsSync(dirPath))
            return;
    
        fs.readdirSync(dirPath).forEach(p => {
            const fullPath = path.join(dirPath, p);
    
            if (fs.statSync(fullPath).isDirectory())
                this._cleanDir(fullPath, true);
            else
                fs.unlinkSync(fullPath);
        });
    
        if (removeItself)
            fs.rmdirSync(dirPath);
    }

    static cleanDir(dirPath) { this._cleanDir(dirPath, false); }

    static writeObjToFile(filePath, obj) {
        this.createDir(path.dirname(filePath));
        fs.writeFileSync(filePath + '.json', JSON.stringify(obj));
    }

    static createDir(dirPath) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    static copyFiles(destDir, ...filePaths) {
        filePaths.forEach(p => this.copyFile(p, destDir));
    }

    static copyFile(filePath, destDir, destFileName = null) {
        fs.copyFileSync(filePath, path.join(destDir, 
            destFileName || path.basename(filePath)));
    }
}

module.exports = { FileSystem };
