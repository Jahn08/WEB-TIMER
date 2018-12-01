function ApiHelper() {
    
    const formQueryOptions = function(token, method = 'GET') {
        return {
            method,
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const processError = (reject, err) => {
        console.error(err);
        reject(err);
    };

    this.logIn = function(token) {
        return new Promise((resolve, reject) => {
            $.ajax('/auth/logIn', formQueryOptions(token, 'POST')).then(resp => resolve(resp))
                .catch(err => processError(reject, `An authentication error has occured: ${err.statusText}`));
        });
    };

    const getQuery = (path, token, entityDescription) => {
        return new Promise((resolve, reject) => {
            $.ajax(path, token ? formQueryOptions(token) : undefined)
                .then(resp => resolve(resp))
                .catch(err => processError(reject, `An error has occured while getting ${entityDescription}: ${err.statusText}`));
        });
    };

    const getPrograms = (action, token) => getQuery('/programs/' + action, token, 'a list of timer programs available');

    this.getDefaultPrograms = function () {
        return getPrograms('default');
    };
    
    this.getActivePrograms = function (token) {
        return getPrograms('active', token);
    };

    this.getUserPrograms = function (token) {
        return getPrograms('', token);
    };

    this.getUserProfileSettings = function (token) {
        return getQuery('/users/profile', token, 'the user\'s profile settings');
    };

    this.getAboutInfo = function () {
        return getQuery('/modules/about', null, 'additional information about the application')
    };

    this.postUserProfileSettings = function (token, settings) {
        return postQuery('/users/profile', token, settings);
    };

    this.deleteUserProfile = function (token) {
        return new Promise((resolve, reject) => {
            $.ajax('/users/profile', formQueryOptions(token, 'DELETE'))
                .then(resp => resolve(resp))
                .catch(err => processError(reject, `An error has occured while deleting the user\'s profile: ${err.statusText}`));
        });
    };

    const postQuery = (path, token, data) => {
        return new Promise((resolve, reject) => {
            let options = formQueryOptions(token, 'POST');
            options.data = JSON.stringify(data);
            options.contentType = 'application/json';

            $.ajax(path, options).then(resp => {
                alert('All changes have been successfully saved');
                resolve(resp);
            }).catch(err => processError(reject, 'An error has occured while saving changes: ' + err.statusText));
        });
    };

    this.postUserPrograms = function (token, programData) {
        return postQuery('/programs', token, programData);
    };

    this.getUserStatistics = function (token, data) {
        return new Promise((resolve, reject) => {
            let options = formQueryOptions(token);
            options.data = data;

            $.ajax('/users', options)
                .then(resp => resolve(resp))
                .catch(err => processError(reject, 'An error has occured while getting user statistics: ' + err.statusText));
        });
    };

    this.postUserAdminRoleSwitch = function (token, userId) {
        return postQuery('/users/adminSwitch', token, {
            id: userId
        });
    };
};

const FbApiHelper = function () {

    const processError = (reject, err) => {
        console.error(err);
        reject(err);
    };

    const runFBCallback = (reject, resolvingCallback) => {
        if (window.FB) {
            try {
                resolvingCallback(window.FB);
            }
            catch (ex) {
                processError(reject, 'An error has occured while dealing with FB API: ' + ex);
            }
        }
        else
            processError(reject, 'FB API is undefined');
    };

    this.initialise = function () {
        return new Promise((resolve, reject) => {
            window.fbAsyncInit = function () {
                runFBCallback(reject, fb => {
                    fb.init({
                        appId: '157829975071233',
                        cookie: true,
                        xfbml: true,
                        version: 'v3.0'
                    });

                    fb.AppEvents.logPageView();
                    fb.getLoginStatus(resp => resolve(resp));
                });
            };
        });
    };

    this.logIn = function () {
        return new Promise((resolve, reject) =>
            runFBCallback(reject, fb => fb.login(resp => resolve(resp),
                { scope: 'public_profile, email, user_gender, user_location' })));
    };

    this.logOut = function () {
        return new Promise((resolve, reject) => runFBCallback(reject, fb => fb.logout(resp => resolve(resp))));
    };

    this.getLoginStatus = function () {
        return new Promise((resolve, reject) => runFBCallback(reject, fb => fb.getLoginStatus(resp => resolve(resp))));
    };

    this.getUserInfo = function () {
        return new Promise((resolve, reject) => runFBCallback(reject, fb =>
            fb.api('/me?fields=name,picture', resp => resolve(resp))));
    };
    
    this.deletePermissions = function (userId) {
        return new Promise((resolve, reject) => runFBCallback(reject, fb =>
            fb.api(`/v3.1/${userId}/permissions`, 'delete', response => {
                resolve(response);
            })));
    };
};

function ProgramUpdater(programList = []) {
    const originalProgIds = programList.map(p => p._id);
    let updatedIds = [];

    this.getQueryData = function (curPrograms) {
        updatedIds = updatedIds.filter(id => originalProgIds.indexOf(id) !== -1);
        const curProgIds = curPrograms.map(p => p._id);

        return {
            deletedIds: originalProgIds.filter(id => curProgIds.indexOf(id) === -1),
            updated: curPrograms.filter(p => updatedIds.indexOf(p._id) !== -1),
            created: curPrograms.filter(p => originalProgIds.indexOf(p._id) === -1)
        };
    };

    this.markUpdated = function (program) {
        if (!updatedIds.find(id => id === program._id))
            updatedIds.push(program._id);
    };
}

export { ApiHelper, FbApiHelper, ProgramUpdater };
