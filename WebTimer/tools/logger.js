function Logger(settings = { level: null }) {
    const errorPropName = 'error';
    const warnPropName = 'warn';
    const infoPropName = 'info';

    const levels = { [errorPropName]: 1, [warnPropName]: 2, [infoPropName]: 3 };
    
    const _level = levels[settings.level] || -1;

    const shouldLog = (level) => _level != -1 && _level >= levels[level];

    const log = (level, msg) => {
        if (shouldLog(level)) {
            const nowStr = new Date(Date.now()).toLocaleString()
            console[level](`${nowStr}, ${level}: ${msg}`);
        }
    };

    this.info = (msg) => log(infoPropName, msg);

    this.warn = (msg) => log(warnPropName, msg);

    this.error = (msg) => log(errorPropName, msg);
};

module.exports = Logger;