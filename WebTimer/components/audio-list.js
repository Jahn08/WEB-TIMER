Components.audioList = {
    props: {
        repeat: {
            type: Boolean,
            default: true
        },
        active: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            audio: Audio,
            optedSoundSrc: null,
            sounds: []
        };
    },
    mounted() {
        const basicUrl = '../resources/audio/';
        
        this.audio = new Audio();

        let _sounds = [
            { name: 'classic alarm', file: 'alarm_classic.mp3' },
            { name: 'alert', file: 'alert_8bit.mp3' },
            { name: "official bell", file: 'bell_official.mp3' },
            { name: "horn", file: "horn.mp3" },
            { name: "horn (wahwah)", file: "horn_wahwah.mp3" }
        ].sort((a, b) => a.name > b.name);
        _sounds.forEach(val => val.file = basicUrl + val.file);
        this.sounds = _sounds;
    },
    methods: {
        onSoundChanged(event) {
            let selectObj = event.target;

            this.optedSoundSrc = selectObj && selectObj.selectedIndex > 0 ?
                selectObj.options[selectObj.selectedIndex].value : null;
        },
        play(playOnce) {
            if (!this.optedSoundSrc || (!this.active && !playOnce)) {
                if (!this.audio.paused)
                    this.audio.pause();

                return;
            }
            
            this.audio.loop = !playOnce && this.repeat;
            this.audio.src = this.optedSoundSrc;
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
            <label for="sounds">Play when the timer ends</label>
            <select class="text-primary" id="sounds" @change="onSoundChanged">
                <option value="">none</option>
                <option v-for="s in sounds" :value="s.file">{{ s.name }}</option>
            </select>
            <button class="btn btn-info btn-sm" @click="play(true)" title="Try out the sound" v-if="optedSoundSrc">&#9835;</button>
        </div>`
};