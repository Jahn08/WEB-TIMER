var Components = {};

Components.globalVm = new Vue();

Components.rowSection = {
    props: {
        marginTop: Number,
        textCenter: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        elStyle() {
            return this.marginTop ? `margin-top:${this.marginTop}px`: '';
        }
    },
    template: `
        <div class="row">
            <div class="offset-md-2 col-md-8" :class="{'text-center':textCenter}" :style="elStyle">
                <slot></slot>    
            </div>
        </div>
    `
};

Components.borderedRowSection = {
    components: {
        'row-section': Components.rowSection
    },
    props: {
        active: Boolean, 
        fontSize: Number,
        textCenter: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        elStyle() {
            let size = this.fontSize;

            if (!size)
                size = 8;

            return `font-size:${size}em;box-shadow:2px 2px 10px;border-radius:25px 25px`;
        }
    },
    template: `
        <row-section :margin-top="20" :text-center="textCenter">
            <div class="border text-primary" :class="{'text-danger':active}" :style="elStyle">
                <slot></slot>
            </div>
        </row-section>
    `
};

Components.watch = {
    props: {
        clockwise: {
            type: Boolean,
            required: true
        },
        inputText: {
            type: String
        }
    },
    data() {
        return {
            buttons: [{
                name: 'Start|Stop',
                shortcut: 'Space',
                keyCodes: ['Space'],
                event: () => {
                    this.running = !this.running;

                    if (this.running === true) {
						let allowedToRun = this.allowed();

                        this.$emit('start', { allowedToRun });

                        if (!allowedToRun) {
                            this.running = false;
                            return;
                        }

                        this.dateStart = new Date();
                        this.elapsedRangeTime = 0;

                        let interval = setInterval(() => {
                            if (this.running === false || this.time < 0) {
                                clearInterval(interval);
                                interval = null;

                                if (this.time < 0) {
                                    this.running = false;
                                    this.reset();
                                }
                            }
                            else if (interval) {
                                let timeDifference = new Date() - this.dateStart;
                                let curValue = timeDifference - this.elapsedRangeTime;

                                if (!this.clockwise)
                                    curValue = -curValue;

                                this.time += curValue;
                                this.elapsedRangeTime = timeDifference;

                                if (this.time <= 0 && !this.clockwise)
                                    this.$emit('end');
                            }
                        }, 12);
                    }
                }
            }, {
                name: 'Lap',
                shortcut: 'Ctrl',
                keyCodes: ['ControlRight','ControlLeft'],
                event: () => {
                    this.laps.push(this.outputText)
                }
            }, {
                name: 'Reset',
                shortcut: 'Esc',
                keyCodes: ['Escape'],
                event: this.reset
            }],
            time: 0,
            outputText: '',
            running: false,
            dateStart: null,
            laps: [],
            elapsedRangeTime: 0
        };
    },
    watch: {
        time() {
            this.computeOutput();
        },
        inputText() {
            this.outputText = this.inputText;
        }
    },
    mounted() {
        window.addEventListener('keydown', this.onKeyDown);

        this.computeOutput();
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        Components.globalVm.$off('watchKeyDown');
    },
    methods: {
        allowed() {
            return this.clockwise || (this.time > 0 || (this.time = this.textToTime()) > 0);
        },
        onKeyDown() {
            const btn = this.buttons.find(el => el.keyCodes.indexOf(event.code) !== -1);

            if (btn && btn.event) {
                btn.event();
                event.preventDefault();
            }
            else {
                Components.globalVm.$emit('watchKeyDown', event);
            }
        },
        timeToText() {
            var t = new Date(this.time);

            let days = t.getUTCDate();
            let hours = (days - 1) * 24;
            return `${this.format(hours + t.getUTCHours())}:${this.format(t.getUTCMinutes())}:${this.format(t.getUTCSeconds())},${this.format(t.getUTCMilliseconds(), 2)}`;
        },
        textToTime() {
            let input = this.outputText.split(',')[0];
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
        },
        reset() {
            // Recompute the output since it might have been changed even without running the component
            if (this.time == 0)
                this.computeOutput();
            else
                this.time = 0;
            
            this.elapsedRangeTime = 0;
            this.dateStart = new Date();

            if (!this.clockwise)
                this.running = false;

            if (!this.running)
                this.laps = [];
            
            this.$emit('reset');
        },
        format(num, figures = 2) {
            let str;
            let outcome;

            if (!num || (str = num.toString()).length < figures) {
                let tempStr = '';

                for (var i = 0; i < figures; ++i)
                    tempStr += '0';

                outcome = (tempStr + num).slice(-figures);
            }
            else
                outcome = str.substr(0, figures);
            
            return outcome;
        }
    },
    components: {
        'bordered-row-section': Components.borderedRowSection,
        'row-section': Components.rowSection
    },
    template: `<div class="container">
		<bordered-row-section :active="running">
            <slot :text="outputText">{{ outputText }}</slot>
        </bordered-row-section>
		<row-section>
            <div class="btn-group btn-group-lg">
                <button v-for="button in buttons" @click="button.event()" :key="button.name" type="button" class="btn btn-outline-primary" style="white-space:pre-wrap">
                    <span>{{ button.name }} \n<span style='opacity:0.6'>press &lt;{{ button.shortcut }}&gt;</span></span>
                </button>
            </div>
        </row-section>
        <bordered-row-section :text-center="false" :font-size="1">
            <div style="height:40vh;overflow-y:scroll">
                <ol>
                   <li v-for="lap in laps">{{ lap }}</li> 
                </ol>                
            </div>
        </bordered-row-section>
    </div>`
};