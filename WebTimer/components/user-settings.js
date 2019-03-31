import banner from '/components/banner.js';
import authListener from '/components/auth-listener.js';
import RouteFormState from '/components/route-form-state.js';
import { audioList } from '/components/audio-list.js';
import { ApiHelper, FbApiHelper } from '/components/api-helper.js';

const userSettings = {
    components: {
        banner,
        authListener,
        audioList
    },
    data() {
        return {
            updating: true,
            user: {
                hideDefaultPrograms: false,
                defaultSoundName: null
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
            this.startUpdating();

            this.apiHelper.postUserProfileSettings(this.authToken, this.user).then(() => {
                this.makeFormPure();
                this.finishUpdating();
            }).catch(this.processError);
        },
        makeFormPure() {
            this.routeFormState.makePure();
            this.isDirty = false;
        },
        processError(err) {
            alert(err);
            this.finishUpdating();
        },
        startUpdating() {
            this.updating = true;
        },
        finishUpdating() {
            this.updating = false;
        },
        makeFormDirty() {
            this.routeFormState.makeDirty();
            this.isDirty = true;
        },
        removeProfile() {
            if (confirm('You are going to delete your profile with all the timer programs you have created. Continue?')) {
                this.startUpdating();

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
                this.apiHelper.getUserProfileSettings(this.authToken).then(res => {
                    this.user = res;
                    this.finishUpdating();
                }).catch(this.processError);
        },
        onSoundNameChange(newSoundName) {
            this.makeFormDirty();
            this.user.defaultSoundName = newSoundName;
        }
    },
    template: `
        <div>
            <banner heading="User Settings"></banner>
            <auth-listener @change="onAuthenticationChange">
                <div v-if="updating">Please wait...</div>
                <div v-else class="container">
                    <audio-list @change="onSoundNameChange" label="Default sound for timers" :sound-name="user.defaultSoundName"></audio-list>
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