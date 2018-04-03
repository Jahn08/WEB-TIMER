Components.timer = {
    components: {
        'watch': Components.watch
    },
    data() {
        return {
            time: 0,
            input: '',
            running: false
        };
    },
    mounted() {
        this.bannerBlink();
    },
    computed: {
        allowed() {
            return this.input > 0;
        }
    },
    methods: {
        onStart() {
            if (!this.allowed)
                this.bannerBlink();
            else
                this.running = true;
        },
        onReset() {
            this.running = false;
            this.input = '';
        },
        bannerBlink() {
            $('#alertInfo').fadeOut(1000)
                .fadeIn(1000);
        },
        onKeyDown(event) {
            let keyVal;

            if (event.key && (keyVal = event.key.trim()) && !isNaN(keyVal = Number(keyVal))) {
                if (this.input.length == 6)
                    this.input = '';

                this.input = keyVal + this.input;
                let temp = Number(this.input);

                let hours = 0;
                if (temp > 10000) {
                    hours = Math.floor(temp / 10000);
                    temp = temp - hours * 10000;

                    if (hours > 23)
                        hours = 23;
                }

                let minutes = 0;
                if (temp > 100) {
                    minutes = Math.floor(temp / 100);

                    if (minutes > 59)
                        minutes = 59;
                }

                let seconds = temp % 100;
                if (seconds > 59)
                    seconds = 59;

                this.time = hours * 3600000 + minutes * 60000 + seconds * 1000;
            }
        }
    },
    template: `
        <div>
            <div>
                <div v-if="!running" id="alertInfo" class="text-center alert alert-info">
                    Start entering figures to set the timer
                </div>
            </div>
            <watch :allowed="allowed" :timing="time" :clockwise="false" @reset="onReset" @start="onStart" @keydown="onKeyDown">    
                <div :title="running ? '': 'Start entering figures to set the timer'" slot-scope="scope">
                    <span>{{ scope.text }}</span>
                </div>
            </watch>
        </div>`
};