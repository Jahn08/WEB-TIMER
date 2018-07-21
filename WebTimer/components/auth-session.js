const AuthSession = function () {
	const tokenParamName = 'authToken';

    this.setToken = function (token) {
        sessionStorage.setItem(tokenParamName, token);
	};

	this.getToken = function () {
        const token = sessionStorage.getItem(tokenParamName);
        return token == undefined + '' ? null : token;
	};
};

export default AuthSession;