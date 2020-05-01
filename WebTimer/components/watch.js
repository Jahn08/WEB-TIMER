import { watchKeyDownEventHelper } from './event-bus.js';

const rowSection = {
    props: {
        marginTop: Number,
        textCentered: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            elStyle: {
                marginTop: this.marginTop ? this.marginTop + 'px': ''
            }
        };
    },
    template: `
        <div class="row">
            <div class="offset-md-2 col-md-8" :class="{'text-center':textCentered}" :style="elStyle">
                <slot></slot>    
            </div>
        </div>
    `
};

const borderedRowSection = {
    components: {
        rowSection
    },
    props: {
        active: Boolean, 
        useSmallFont: {
            type: Boolean,
            default: false
        },
        textCentered: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            elStyle: {
                boxShadow: '2px 2px 10px',
                borderRadius: '25px 25px'
            }
        };
    },
    template: `
        <row-section :margin-top="20" :text-centered="textCentered">
            <div class="border text-primary" :class="{'text-danger':active,'fontLg':!useSmallFont}" :style="elStyle">
                <slot></slot>
            </div>
        </row-section>
    `
};

const watch = {
    props: {
        clockwise: {
            type: Boolean,
            required: true
        },
        inputText: {
            type: String
        },
        msStageArray: {
            type: Array
        },
        inactive: {
            type: Boolean
        }
    },
    data() {
        const spaceKeyCode = 'Space';

        return { 
            SPACE_KEY_CODE: spaceKeyCode,
            buttons: [{
                name: 'Start|Stop',
                shortcut: 'Space',
                keyCodes: [spaceKeyCode],
                event: this.start
            }, {
                name: 'Lap',
                shortcut: 'Ctrl',
                keyCodes: ['ControlRight','ControlLeft'],
                event: () => {
                    this.laps.unshift(this.outputText);
                }
            }, {
                name: 'Reset',
                shortcut: 'Esc',
                keyCodes: ['Escape'],
                event: this.reset
            }],
            time: 0,
            outputText: '',
            isRun: false,
            dateStart: null,
            laps: [],
            elapsedRangeTime: 0,
            originalTitle: null,
            stages: []
        };
    },
    watch: {
        time() {
            this.computeOutput();
        },
        inputText() {
            this.outputText = this.inputText ? this.inputText.trim(): '';

            if (!this.outputText)
                this.computeOutput();
        },
        msStageArray() {
            this.initialiseStages();
        }
    },
    mounted() {
        window.addEventListener('keydown', this.onKeyDown);

        this.originalTitle = document.title;
        this.computeOutput();

        this.initialiseStages();
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        watchKeyDownEventHelper.removeAllListeners();
    },
    methods: {
        initialiseStages() {
            if (this.msStageArray && this.msStageArray.length > 0) {
                this.stages = this.msStageArray.map(val => this.timeToText(val));
                const timeSum = this.msStageArray.reduce((pv, cv) => pv + cv);

                this.$emit('stageInitialised', this.stages, this.timeToText(timeSum));
                this.nextStage();
            }
        },
        start() {
            this.isRun = !this.isRun;

            if (this.isRun === true) {
                const allowedToRun = this.allowed();

                this.$emit('start', { allowedToRun });

                if (!allowedToRun) {
                    this.isRun = false;
                    return;
                }

                this.dateStart = new Date();
                this.elapsedRangeTime = 0;

                let interval = setInterval(() => {
                    if (this.isRun === false || this.time < 0) {
                        clearInterval(interval);
                        interval = null;
                        let hasNextStage;

                        // Time is over - not a pause
                        if (this.time < 0) {
                            hasNextStage = this.nextStage();
                            this.isRun = false;

                            if (!hasNextStage)
                                this.reset();

                            if (!this.clockwise) {
                                this.$emit('end', hasNextStage);

                                if (hasNextStage)
                                    this.start();
                            }
                        }
                    }
                    else if (interval) {
                        const timeDifference = new Date() - this.dateStart;
                        let curValue = timeDifference - this.elapsedRangeTime;

                        if (!this.clockwise)
                            curValue = -curValue;

                        this.time += curValue;
                        this.elapsedRangeTime = timeDifference;
                    }
                }, 12);
            }
        },
        nextStage() {
            const nextTimeText = this.stages && this.stages.length > 0 ? this.stages.shift() : null;

            if (nextTimeText != null) {
                this.outputText = nextTimeText;
            }
            
            return nextTimeText != null;
        },
        allowed() {
            return !this.inactive && (this.clockwise || (this.time > 0 || (this.time = this.textToTime()) > 0));
        },
        onKeyDown() {
            const event = window.event || arguments[0];
            const btn = this.buttons.find(el => el.keyCodes.indexOf(event.code) !== -1);

            if (this.inactive)
                return true;

            if (btn && btn.event && (event.target.localName !== 'button' || 
                event.code !== this.SPACE_KEY_CODE)) {
                btn.event();
                event.preventDefault();
            }
            else {
                watchKeyDownEventHelper.emitEvent(event);
            }
        },
        timeToText(timeVal) {
            const t = new Date(timeVal ? timeVal: this.time);
            
            const hours = (t.getUTCDate() - 1) * 24;
            return `${this.format(hours + t.getUTCHours())}:${this.format(t.getUTCMinutes())}:${this.format(t.getUTCSeconds())},${this.format(t.getUTCMilliseconds(), 2)}`;
        },
        textToTime() {
            const input = this.outputText.split(',')[0];
            let temp = Number(input.replace(/:/g, ''));
            
            let hours = 0;
            if (temp >= 10000) {
                hours = Math.floor(temp / 10000);
                temp = temp - hours * 10000;

                if (hours > 29)
                    hours = 29;
            }

            let minutes = 0;
            if (temp >= 100) {
                minutes = Math.floor(temp / 100);

                if (minutes > 59)
                    minutes = 59;
            }

            let seconds = temp % 100;
            if (seconds > 59)
                seconds = 59;

            return hours * 3600000 + minutes * 60000 + seconds * 1000;
        },
        computeOutput() {
            this.outputText = this.timeToText();

            if (this.isRun)
                this.setDocumentTitle(this.outputText);
        },
        setDocumentTitle(title) {
            document.title = title ? title : this.originalTitle;
        },
        reset() {
            // Recompute the output since it might have been changed even without running the component
            if (this.time == 0)
                this.computeOutput();
            else
                this.time = 0;
            
            this.elapsedRangeTime = 0;
            this.dateStart = new Date();

            if (!this.clockwise) {
                this.$nextTick(() => this.initialiseStages());
                this.isRun = false;
            }

            if (!this.isRun) {
                this.laps = [];
                this.setDocumentTitle();
            }
            
            this.$emit('reset');
        },
        format(num, figures = 2) {
            let str;
            let outcome;

            if (!num || (str = num.toString()).length < figures) {
                let tempStr = '';

                for (let i = 0; i < figures; ++i)
                    tempStr += '0';

                outcome = (tempStr + num).slice(-figures);
            }
            else
                outcome = str.substr(0, figures);
            
            return outcome;
        }
    },
    components: {
        borderedRowSection,
        rowSection
    },
    template: `<div class="container">
		<bordered-row-section :active="isRun">
            <slot :text="outputText">{{ outputText }}</slot>
        </bordered-row-section>
		<row-section>
            <div class="btn-group btn-group-lg">
                <button v-for="button in buttons" @click="button.event()" :key="button.name" type="button" class="btn btn-outline-primary preserveSpaces">
                    <span>{{ button.name }} \n<span class="slightlyTransparent">press &lt;{{ button.shortcut }}&gt;</span></span>
                </button>
            </div>
        </row-section>
        <bordered-row-section :text-centered="false" :useSmallFont="true">
            <div class="lapSection">
                <ul>
                   <li v-for="(lap, index) in laps">{{ laps.length - index }}. {{ lap }}</li> 
                </ul>                
            </div>
        </bordered-row-section>
    </div>`
};

export default watch;