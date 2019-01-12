import banner from '/components/banner.js';
import authListener from '/components/auth-listener.js';
import RouteFormState from '/components/route-form-state.js';
import { ApiHelper, FbApiHelper } from '/components/api-helper.js';

const userSettings = {
    components: {
        banner,
        authListener
    },
    data() {
        return {
            saving: false,
            user: {
                hideDefaultPrograms: false
            },
            authToken: null, 
            apiHelper: new ApiHelper(),
            fbApiHelper: new FbApiHelper(),
            routeFormState: RouteFormState.constructFromScope(this),
            isDirty: false
        };
    },
    methods: {
        update() {
            this.startSaving();

            this.apiHelper.postUserProfileSettings(this.authToken, this.user).then(() => {
                this.makeFormPure();
                this.finishSaving();
            }).catch(this.processError);
        },
        makeFormPure() {
            this.routeFormState.makePure();
            this.isDirty = false;
        },
        processError(err) {
            alert(err);
            this.finishSaving();
        },
        startSaving() {
            this.saving = true;
        },
        finishSaving() {
            this.saving = false;
        },
        makeFormDirty() {
            this.routeFormState.makeDirty();
            this.isDirty = true;
        },
        removeProfile() {
            if (confirm('You are going to delete your profile with all the timer programs you have created. Continue?')) {
                this.startSaving();

                this.apiHelper.deleteUserProfile(this.authToken).then(() => {
                    this.fbApiHelper.getUserInfo().then(userInfo =>
                        this.fbApiHelper.deletePermissions(userInfo.id).then(() => 
                            this.$router.push('/', () => {
                                location.reload();
                            })));
                }).catch(this.processError);
            }
        },
        onAuthenticationChange(authToken) {
            this.authToken = authToken;

            this.getUserSettingsFromServer();
        },
        getUserSettingsFromServer() {
            if (this.authToken)
                this.apiHelper.getUserProfileSettings(this.authToken).then(res => this.user = res).catch(this.processError);
        }
    },
    template: `
        <div>
            <banner heading="User Settings"></banner>
            <auth-listener @change="onAuthenticationChange">
                <div v-if="saving">Please wait...</div>
                <div v-else class="container">
                    <div class="form-group form-check">
                        <input type="checkbox" class="form-check-input" id="hideDefaultProgramsCheck" v-model="user.hideDefaultPrograms" @change="makeFormDirty">
                        <label class="form-check-label" for="hideDefaultProgramsCheck">Hide default programs</label>
                    </div>
                    <button :disabled="!isDirty" type="button" class="btn btn-outline-primary" @click="update">Update</button>
                    <button type="button" class="btn btn-outline-info" @click="removeProfile">Remove Profile</button>
                </div>
            </auth-listener>
        </div>`
};

export default userSettings;