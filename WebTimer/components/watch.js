var Components = {};

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
        allowed: {
            type: Boolean,
            default: true
        },
        timing: {
            type: Number,
            default: 0
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
                        this.$emit('start');

                        if (!this.allowed) {
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
                            }
                        }, 12);
                    }
                }
            }, {
                name: 'Lap',
                shortcut: 'Ctrl',
                keyCodes: ['ControlRight','ControlLeft'],
                event: () => {
                    this.laps.push(this.currentTime)
                }
            }, {
                name: 'Reset',
                shortcut: 'Esc',
                keyCodes: ['Escape'],
                event: this.reset
            }],
            time: 0,
            running: false,
            dateStart: null,
            laps: [],
            elapsedRangeTime: 0
        };
    },
    computed: {
        currentTime() {
            var t = new Date(this.time);
            return `${this.format(t.getUTCHours())}:${this.format(t.getUTCMinutes())}:${this.format(t.getUTCSeconds())},${this.format(t.getUTCMilliseconds(),2)}`;
        }
    },
    watch: {
        timing() {
            this.time = this.timing;
        }
    },
    mounted() {
        window.addEventListener("keydown", (event) => {
            var btn = this.buttons.find(el => el.keyCodes.indexOf(event.code) !== -1);

            if (btn && btn.event) {
                btn.event();
                event.preventDefault();
            }
            else {
                this.$emit("keydown", event);
            }
        });
    },
    methods: {
        reset() {
            this.time = 0;
            this.elapsedRangeTime = 0;

            if (this.running) {
                this.dateStart = new Date();
            }
            else {
                this.dateStart = new Date();
                this.laps = [];
            }

            this.$emit('reset');
        },
        format(num, figures = 2) {
            let str;

            if (!num || (str = num.toString()).length < figures) {
                let tempStr = '';

                for (var i = 0; i < figures; ++i)
                    tempStr += '0';

                return (tempStr + num).slice(-figures);
            }
            
            return str.substr(0, figures);
        }
    },
    components: {
        'bordered-row-section': Components.borderedRowSection,
        'row-section': Components.rowSection
    },
    template: `<div class="container">
		<bordered-row-section :active="running">
            <slot :text="currentTime">{{ currentTime }}</slot>
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