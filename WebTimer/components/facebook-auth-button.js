import ApiHelper from '/components/api-helper.js';

const facebookAuthButton = {
    data() {
        return {
            loggedIn: null,
            userName: null
        };
    },
    beforeCreate() {
        let component = this;

        let initialiseFbSdk = function () {
            window.fbAsyncInit = function () {
                FB.init({
                    appId: '157829975071233',
                    cookie: true,
                    xfbml: true,
                    version: 'v3.0'
                });

                FB.AppEvents.logPageView();
                FB.getLoginStatus(function (response) {
                    if (component && component.statusChangeCallback)
                        component.statusChangeCallback(response);
                });
            };
        };

        let insertingFbSdkScript = function () {
            const sdkTagId = 'facebook-jssdk'

            if (document.getElementById(sdkTagId))
                return;

            const scriptTagName = 'script';
            let sdkScriptTag = document.createElement(scriptTagName);
            sdkScriptTag.id = sdkTagId;
            sdkScriptTag.src = "https://connect.facebook.net/en_US/sdk.js";

            const firstScriptTag = document.getElementsByTagName(scriptTagName)[0];
            firstScriptTag.parentNode.insertBefore(sdkScriptTag, firstScriptTag);
        };

        initialiseFbSdk();
        insertingFbSdkScript();
    },
    methods: {
        logIn() {
            let component = this;

            FB.login(function (response) {
                component.statusChangeCallback(response);
            }, { scope: 'public_profile, email' });
        },
        setUserName() {
            let component = this;

            FB.api('/me', function (response) {
                component.userName = response.name;
            });
        },
        statusChangeCallback(response) {
            if (this.authResponseIsSuccessful(response)) {
                this.sendUserDataToServer(response.authResponse.accessToken);
                this.setUserName();
            } else {
                this.setUserStateLoggedOut();
                console.log('User cancelled login or did not fully authorize.');
            }
        },
        sendUserDataToServer(token) {
            let component = this;

            const apiHelper = new ApiHelper();
            apiHelper.logIn(token).then(resp => this.setUserStateLoggedIn(token))
                .catch(err => component.logOut());
        },
        setUserStateLoggedIn(token) {
            this.loggedIn = true;
            this.$emit('logged-in', token);
        },
        logOut() {
            let component = this;

            FB.logout(function (response) {
                component.statusChangeCallback(response);
            });
        },
        setUserStateLoggedOut() {
            this.loggedIn = false;
            this.$emit('logged-out');
        },
        checkLoginState() {
            let component = this;

            FB.getLoginStatus(function (response) {
                component.statusChangeCallback(response);
            });
        },
        authResponseIsSuccessful(response) {
            return response.authResponse && response.status === 'connected';
        }
    },
    template: `
        <div>
            <div v-if="loggedIn === false">
                <button @click="logIn" type="button" class="fbBtn btn btn-sm">
                    <div class="fbXvm">
                        <table class="fbBtnTable fb5h0i fb5f0n" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <td>
                                        <div>
											<span class="fb5h0k">
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 216" class="fb5h0m" color="#FFFFFF">
													<path fill="#FFFFFF" d="M204.1 0H11.9C5.3 0 0 5.3 0 11.9v192.2c0 6.6 5.3 11.9 11.9
														11.9h103.5v-83.6H87.2V99.8h28.1v-24c0-27.9 17-43.1 41.9-43.1
														11.9 0 22.2.9 25.2 1.3v29.2h-17.3c-13.5 0-16.2 6.4-16.2
														15.9v20.8h32.3l-4.2 32.6h-28V216h55c6.6 0 11.9-5.3
														11.9-11.9V11.9C216 5.3 210.7 0 204.1 0z">
													</path>
												</svg>
											</span>
										</div>
									</td>
									<td>
										<div>
											<div>Log In</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
                    </div>    
                </button>
            </div>
            <div v-if="loggedIn === true && userName">
                <ul class="navbar-nav mr-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true">
                         {{ userName }}
                    </a>
                    <div class="dropdown-menu" aria-labelledby="navbarDropdown">
	                    <router-link class="dropdown-item" to="/profile">
                            Profile
                        </router-link>
	                    <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#" @click="logOut">Log Out</a>
                    </div>
                </li>
                </ul>
            </div>
        </div>`
};

export default facebookAuthButton;