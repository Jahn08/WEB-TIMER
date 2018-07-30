function ApiHelper() {
    
    const formQueryOptions = function(token, method = 'GET') {
        return {
            method,
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };
    
    this.logIn = function(token) {
        const promise = new Promise((resolve, reject) => {
            $.ajax('/auth/logIn', formQueryOptions(token, 'POST')).then(resp => resolve(resp))
                .catch(function(err) {
                    alert(`An authentication error has occured: ${err.statusText}`);
                    reject(err);
                });
        });

        return promise;
    };

    const getPrograms = (action, token) => {
        return new Promise((resolve, reject) => {
            $.ajax('/programs/' + action, token ? formQueryOptions(token) : undefined)
                .then(resp => resolve(resp))
                .catch(err => {
                    alert('An error has occured while getting a list of timer programs available: ' + err.statusText);
                    reject(err);
                });
        });
    };

    this.getDefaultPrograms = function () {
        return getPrograms('default');
    };

    this.getActivePrograms = function (token) {
        return getPrograms('active', token);
    };

    this.getUserPrograms = function (token) {
        return getPrograms('', token);
    };

    this.postUserPrograms = function(token, programs) {
        const promise = new Promise((resolve, reject) => {
            let options = formQueryOptions(token, 'POST');
            options.data = JSON.stringify({ programs });
            options.contentType = 'application/json';

            $.ajax('/programs', options).then(resp => {
                alert('All changes have been successfully saved');
                resolve(resp);
            }).catch(err => {
                alert('An error has occured while saving changes to your timer programs: ' + err.statusText);
                reject(err);
            });
        });

        return promise;
    };

    this.getUserStatistics = function (token, data) {
        return new Promise((resolve, reject) => {
            let options = formQueryOptions(token);
            options.data = data;

            $.ajax('/users', options)
                .then(resp => resolve(resp))
                .catch(err => {
                    alert('An error has occured while getting user statistics: ' + err.statusText);
                    reject(err);
                });
        });
    };

};

export default ApiHelper;