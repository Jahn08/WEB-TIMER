function Logger(level) {
    const errorPropName = 'error';
    const warnPropName = 'warn';
    const infoPropName = 'info';

    const levels = { [errorPropName]: 1, [warnPropName]: 2, [infoPropName]: 3 };
    
    const _level = levels[level] || -1;

    const shouldLog = (level) => _level != -1 && _level >= levels[level];

    const formatScopeName = (callee, ...scopeNames) => {
        const stack = new Error().stack;
        const methods = stack.match(/at .* (?=\()+/gm)
            .map(m => m.trim().split(' ')[1]);
        const logMethodIndex = methods.findIndex(m => m.endsWith(callee)) + 1;
        scopeNames.push(methods[logMethodIndex]);

        return scopeNames.join('.');
    };

    const log = (level, msg, ...scopeNames) => {
        if (shouldLog(level)) {
            const scopeName = formatScopeName(level, ...scopeNames);
            const nowStr = new Date(Date.now()).toLocaleString()

            console[level](`${nowStr}. ${scopeName}, ${level.toUpperCase()}: ${msg}`);
        }
    };

    this.startLogging = (...scopeNames) => {
        return {
            [infoPropName](msg) { log(arguments.callee.name, msg, scopeNames); },

            [warnPropName](msg) { log(arguments.callee.name, msg, scopeNames); },

            [errorPropName](msg) { log(arguments.callee.name, msg, scopeNames); }
        };
    };
};

module.exports = Logger;