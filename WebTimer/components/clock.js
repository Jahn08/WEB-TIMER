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
            <div class="col"></div>
            <div class="col-10" :class="{'text-center':textCenter}" :style="elStyle">
                <slot></slot>    
            </div>
            <div class="col"></div>            
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

Components.clock = {
    data() {
        return {
            buttons: [{
                name: 'Start|Stop',
                shortcut: 'Space',
                keyCodes: ['Space'],
                event: () => {
                    this.running = !this.running;

                    if (this.running === true) {

                        if (!this.dateStart)
                            this.dateStart = new Date();

                        let interval = setInterval(() => {
                            if (this.running === false) {
                                clearInterval(interval);
                                interval = null;
                            }
                            else if (interval) {
                                let now = new Date();
                                this.time = now - this.dateStart;
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
                event: () => {
                    this.time = 0;
                    this.dateStart = this.running ? new Date() : null;
                    this.laps = [];
                }
            }],
            time: 0,
            running: false,
            dateStart: null,
            laps: []
        };
    },
    computed: {
        currentTime() {
            var t = new Date(this.time);
            return `${this.format(t.getUTCHours())}:${this.format(t.getUTCMinutes())}:${this.format(t.getUTCSeconds())},${this.format(t.getUTCMilliseconds(), 3)}`;
        }
    },
    mounted() {
        window.addEventListener("keydown", (event) => {
            var btn = this.buttons.find(el => el.keyCodes.indexOf(event.code) !== -1);

            if (btn && btn.event)
                btn.event();

            event.preventDefault();
        });
    },
    methods: {
        format(num, figures = 2) {
            let _str = '';

            for (var i = 0; i < figures; ++i)
                _str += '0';

            return (_str + num).slice(-figures);
        }
    },
    components: {
        'bordered-row-section': Components.borderedRowSection,
        'row-section': Components.rowSection
    },
	template: `<div class="container">
		<bordered-row-section :active="running">{{ currentTime }}</bordered-row-section>
		<row-section>
            <div class="btn-group btn-group-lg">
                <button v-for="button in buttons" @click="button.event()" :key="button.name" type="button" class="btn btn-outline-primary" style="white-space:pre-wrap">
                    <span>{{ button.name }} \n<span style='opacity:0.6'>press &lt;{{ button.shortcut }}&gt;</span></span>
                </button>
            </div>
        </row-section>
        <bordered-row-section :text-center="false" :font-size="1">
            <div style="height:40vh;overflow-x:scroll">
                <ol>
                   <li v-for="lap in laps">{{ lap }}</li> 
                </ol>                
            </div>
        </bordered-row-section>
    </div>`
};