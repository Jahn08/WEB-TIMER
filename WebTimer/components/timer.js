import watch from './watch.js';
import { audioList } from './audio-list.js';
import banner from './banner.js';
import timeSwitch from './time-switch.js';
import { modal } from './bootstrap-controls.js';
import { Animation } from './animation.js';

const timer = {
    components: {
        watch,
        audioList,
        banner,
        timeSwitch,
        modal
    },
    data() {
        return {
            isRun: false,
            shouldPlaySound: false,
            inputText: '',
            tipText: 'Start entering figures or use switches to set the timer',
            timerIsInactive: false,
            animation: new Animation('alertHeading')
        };
    },
    mounted() {
        this.bannerBlink();
    },
    methods: {
        onStart(event) {
            if (!event.allowedToRun)
                this.bannerBlink();
            else {
                this.isRun = true;
            }
        },
        onEnd() {
            this.timerIsInactive = true;
            this.shouldPlaySound = true;
        },
        onReset() {
            this.isRun = false;
            this.inputText = '';
        },
        bannerBlink() {
            this.animation.blink();
        },
        onTextChange(newValue) {
            this.inputText = newValue;
        },
        onModalHiding() {
            this.shouldPlaySound = false;
            this.timerIsInactive = false;
        }
    },
    template: `
        <div>
            <banner heading="Timer">
                <div :class="{'d-none':isRun}" class="text-center">
                    <hr/>
                    <h2 id="alertHeading">{{ tipText }}</h2>
                    <audio-list :active="shouldPlaySound"></audio-list>
                </div>
            </banner>
            <watch :inactive="timerIsInactive" :clockwise="false" @reset="onReset" @start="onStart" @end="onEnd" :inputText="inputText">    
                <div :title="isRun ? '': tipText" slot-scope="scope">
                    <span v-if="!isRun"><time-switch @change='onTextChange' :text="scope.text"></time-switch></span>
                    <span v-else>{{ scope.text }}</span>
                </div>
            </watch>
            <modal :show="shouldPlaySound" title="Time is over" @hiding="onModalHiding()">
                <p>Close the window to set timer again</p>
            </modal>
        </div>`
};

export default timer;