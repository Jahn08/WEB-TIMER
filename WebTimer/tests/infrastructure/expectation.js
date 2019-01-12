const assert = require('assert');

let callbackIsFuncton = (callback) => typeof callback === 'function';
let callIfFuncton = (callback) => {
    if (callbackIsFuncton(callback))
        callback();
};
let assertCallbackIsFuncton = (callback) => assert(callbackIsFuncton(callback));

exports.tryCatchForPromise = (reject, callback) => {
    try {
        assertCallbackIsFuncton(callback);

        callback();
    }
    catch (ex) {
        reject(ex);
    }
};

exports.expectError = (callback) => {
    assertCallbackIsFuncton(callback);
    let exception;

    try {
        callback();
    }
    catch (ex) {
        exception = ex;
    }

    assert(exception);
};

exports.expectRejection = (callback, onRejecting) => {
    assertCallbackIsFuncton(callback);

    return new Promise((resolve, reject) => {
        callback().then(() => reject('It shouldn\'t have been here, since an error was expected'))
            .catch(err => {
                try {
                    callIfFuncton(onRejecting);

                    assert(err);
                    resolve(err);
                }
                catch (ex) {
                    reject(ex);
                }
            });
    });
};