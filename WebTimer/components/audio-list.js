import { ProgramApi } from './api.js';
import authListener from './auth-listener.js';

const Sounds = function (token = null) {
    this.token = token;
    this._sounds;

    const getSoundsInternally = (internal = false) => {
        const filterFunc = s => (internal && s.internal) ||  (!internal && !s.internal);
        
        return new Promise((resolve, reject) => {
            if (!this._sounds) {
                new ProgramApi().getSounds(this.token)
                    .then(outcome => {
                        this._sounds = outcome;
                        resolve(this._sounds.filter(filterFunc));
                    })
                    .catch(reject);
            }
            else
                resolve(this._sounds.filter(filterFunc));
        });
    };
    
    this.getListOfSoundsToChoose = () => getSoundsInternally();

    this.getListOfSystemSounds = () => getSoundsInternally(true);
};

const audioList = {
    components: {
        'auth-listener': authListener
    },
    props: {
        repeat: {
            type: Boolean,
            default: true
        },
        active: {
            type: Boolean,
            default: false
        },
        soundName: {
            type: String
        },
        label: {
            type: String,
            default: 'Play when the timer ends'
        }
    },
    data() {
        return {
            audio: new Audio(),
            sounds: [],
            authToken: null,
            loading: true,
            activeSound: null
        };
    },
    computed: {
        optedSoundSrc() {
            return this.activeSound ? this.activeSound.file : null;
        }
    },
    methods: {
        initialiseSoundList(authToken, loggedOut) {
            if (loggedOut)
                return;
            
            this.startLoading();

            const soundList = new Sounds(authToken);

            soundList.getListOfSoundsToChoose().then(sounds => {
                this.sounds = sounds;

                if (this.soundName)
                    this.setActiveSoundByName(this.soundName);
                else
                    this.activeSound = sounds.find(s => s.active);
                
                soundList.getListOfSystemSounds().then(sysSounds => {
                    this.$emit('loaded', sysSounds);

                    this.finishLoading();
                });
            }).catch(this.processError);
        },
        startLoading() {
            this.loading = true;
        },
        setActiveSoundByName(soundName) {
            this.activeSound  = this.sounds.find(s => soundName && s.name === soundName);
        },
        processError(err) {
            alert(err);
            this.finishLoading();
        },
        finishLoading() {
            this.loading = false;
        },
        onSoundChanged(event) {
            const selectObj = event.target;
            const chosenSoundName = selectObj.options[selectObj.selectedIndex].value;
            this.setActiveSoundByName(chosenSoundName);
        
            this.$emit('change', chosenSoundName);
        },
        isSelected(sound) {
            return this.activeSound ? this.activeSound.name === sound.name : false;
        },
        play(playOnce) {
            const soundFileSrc = this.optedSoundSrc;

            if (!soundFileSrc || (!this.active && !playOnce)) {
                if (!this.audio.paused)
                    this.audio.pause();

                return;
            }
            
            this.audio.loop = !playOnce && this.repeat;
            this.audio.src = soundFileSrc;
            this.audio.play();
        }
    },
    watch: {
        active() {
            this.play();
        }
    },
    template: `
        <div>
            <auth-listener @change="initialiseSoundList"></auth-listener>
            <div v-if="loading">Please wait...</div>
            <span v-else>
                <label for="sounds">{{ label }}</label>
                <select class="text-primary" id="sounds" @change="onSoundChanged">
                    <option value="none">none</option>
                    <option v-for="s in sounds" :value="s.name" :selected="isSelected(s)">{{ s.name }}</option>
                </select>
                <button class="btn btn-info btn-sm" @click="play(true)" title="Try out the sound" v-if="optedSoundSrc">&#9835;</button>
            </span>
        </div>`
};

export { audioList };