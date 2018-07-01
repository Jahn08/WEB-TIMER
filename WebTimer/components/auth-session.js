const AuthSession = function () {
	const tokenParamName = 'authToken';

	this.setToken = function (token) {
		sessionStorage.setItem(tokenParamName, token);
	};

	this.getToken = function () {
		return sessionStorage.getItem(tokenParamName);
	};
};

export default AuthSession;