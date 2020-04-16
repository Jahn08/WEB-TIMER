import banner from '/components/banner.js';
import authListener from '/components/auth-listener.js';
import RouteFormState from '/components/route-form-state.js';
import { audioList } from '/components/audio-list.js';
import { UserApi, FbApi } from './api.js';

const userSettings = {
    components: {
        banner,
        authListener,
        audioList
    },
    data() {
        return {
            initialised: false,
            updating: false,
            user: {
                hideDefaultPrograms: false,
                defaultSoundName: null
            },
            api: null,
            fbApi: new FbApi(),
            routeFormState: RouteFormState.constructFromScope(this),
            isDirty: false
        };
    },
    methods: {
        update() {
            this.startUpdating();

            this.api.saveSettings(this.user).then(() => {
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

                this.api.deleteProfile().then(() => {
                    this.fbApi.getUserInfo().then(userInfo =>
                        this.fbApi.deletePermissions(userInfo.id).then(() => 
                            this.$router.push('/', () => {
                                location.reload();
                            })));
                }).catch(this.processError);
            }
        },
        onAuthenticationChange(authToken) {
            if (!authToken)
                return;

            this.api = new UserApi(authToken);

            this.getUserSettingsFromServer();
        },
        getUserSettingsFromServer() {
            this.api.getSettings().then(res => {
                this.user = res;
                this.initialised = true;
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
                <div v-if="updating || !initialised">Please wait...</div>
                <div v-if="initialised" v-show="!updating" class="container">
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