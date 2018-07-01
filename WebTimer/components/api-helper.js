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

    this.getDefaultPrograms = function() {
        const promise = new Promise((resolve, reject) => {
            $.ajax('/programs/default')
                .then(resp => resolve(resp))
                .catch(err => {
                    alert('An error has occured while getting a list of default timer programs available: ' + err.statusText);
                    reject(err);
                });
        });

        return promise;
    };
    
    this.getUserPrograms = function(token) {
        const promise = new Promise((resolve, reject) => {
            $.ajax('/programs', formQueryOptions(token)).then(resp => resolve(resp))
                .catch(err => {
                    alert('An error has occured while getting a list of your timer programs: ' + err.statusText);
                    reject(err);
                });
        });

        return promise;
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

};

export default ApiHelper;