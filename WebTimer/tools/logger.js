function Logger(level) {
    const errorPropName = 'error';
    const warnPropName = 'warn';
    const infoPropName = 'info';

    const levels = { [errorPropName]: 1, [warnPropName]: 2, [infoPropName]: 3 };
    
    const _level = levels[level] || -1;

    const shouldLog = (level) => _level != -1 && _level >= levels[level];

    const log = (level, msg, scopeName) => {
        if (shouldLog(level)) {
            const nowStr = new Date(Date.now()).toLocaleString()
            console[level](`${nowStr}. ${scopeName}, ${level.toUpperCase()}: ${msg}`);
        }
    };

    const formatScopeName = (...scopeNames) => scopeNames.join('.');

    this.startLogging = (...scopeNames) => {
        return {
            info(msg) { log(infoPropName, msg, formatScopeName(scopeNames, arguments.callee.name)); },

            warn(msg) { log(warnPropName, msg, formatScopeName(scopeNames, arguments.callee.name)); },

            error(msg) { log(errorPropName, msg, formatScopeName(scopeNames, arguments.callee.name)); }
        };
    };
};

module.exports = Logger;