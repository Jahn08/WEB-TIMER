class Api {
    constructor(controllerName) {
        this._ctrlName = controllerName;
    }

    async _getEntity(action, entityDescription, token = null) {
        try {
            return await this._get(action, null, token);
        }
        catch (err) {
            throw new Error(`An error has occured while getting ${entityDescription}: '${err}'`);
        }
    }

    _get(action, data, token) {
        return this._request(action, 'GET', data, token);
    }

    async _request(path, method, data, token = null) {
        const options = { method, headers: {} };

        if (token)
            options.headers['Authorization'] = `Bearer ${token}`;

        if (data) {
            if (method === this._POST_VERB) {
                options.body = JSON.stringify(data);
                options.headers['Content-Type'] = 'application/json';
            }
            else
                path = this._compileQueryPath(data);
        }
        
        const resp = await fetch(`/${this._ctrlName}/${path}`, options);
        
        const outcomeStr = await resp.text();

        if (!resp.ok) {
            console.error(`An error has occurred on '${path}': '${resp.statusText}, ${outcomeStr}'`);
            throw new Error(resp.statusText);
        }

        return outcomeStr ? JSON.parse(outcomeStr) : {};
    }

    get _POST_VERB() { return 'POST'; }

    _compileQueryPath(data) {
        if (!data)
            return '';
        
        let path = '';

        for (const prop in data) {
            const val = data[prop];

            if (val)
                path += `${path ? '&' : ''}${prop}=${val}`;
        }

        return path ? '?' + path : '';
    }

    _post(action, token, data = null) {
        return this._request(action, this._POST_VERB, data, token);
    }

    _delete(action, token) {
        return this._request(action, 'DELETE', null, token);
    }
}

class ProgramApi extends Api {
    constructor() { super('programs'); }
    
    getSounds(token = null) {
        const entityName = 'a list of available sounds';
        return token ? this._getEntity('sounds', entityName, token): 
            this._getEntity('defaultSounds', entityName);
    }

    getDefaultPrograms() { return this._getPrograms('default'); }
    
    _getPrograms(action, token = null) {
        return this._getEntity(action, 'a list of available timer programs', token);
    }

    getActivePrograms(token) { return this._getPrograms('active', token); }

    getUserPrograms(token) { return this._getPrograms('', token); }

    saveUserPrograms(token, data) { return this._post('', token, data); }
}

class UserApi extends Api {
    constructor(token) { 
        super('users'); 
        
        this._token = token;
    }
    
    get _ACTION_NAME() { return 'profile'; }

    getSettings() {
        return this._getEntity(this._ACTION_NAME, 'the user\'s profile settings', this._token);
    }

    saveSettings(settings) {
        return this._post(this._ACTION_NAME, this._token, settings);
    }

    async deleteProfile() {
        try {
            return await this._delete(this._ACTION_NAME, this._token);
        }
        catch (err) {
            throw new Error(`An error has occured while deleting the user's profile: '${err}'`);
        }
    }

    async getStatistics(data) {
        try {
            return await this._get('', data, this._token);
        }
        catch (err) {
            throw new Error(`An error has occured while getting user statistics: '${err}'`);
        }
    }

    switchAdminRole(userId) {
        return this._post('adminSwitch', this._token, { id: userId });
    }
}

class AuthApi extends Api {
    constructor() { super('auth'); }

    async logIn(token) {
        try {
            return await this._post('logIn', token);
        }
        catch (err) {
            throw new Error(`An authentication error has occured: '${err}'`);
        }
    }
}

class ModuleApi extends Api {
    constructor() { super('modules'); }

    getAboutInfo() {
        return this._getEntity('about', 'additional information about the application');
    }
}

function FbApi() {
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
                processError(reject, `An error has occured while dealing with FB API: '${ex}'`);
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
                        version: 'v6.0'
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
}

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

export { ProgramApi, UserApi, AuthApi, ModuleApi, FbApi, ProgramUpdater };
