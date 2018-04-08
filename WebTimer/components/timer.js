Components.timer = {
    components: {
        'watch': Components.watch,
        'audioList': Components.audioList
    },
    data() {
        return {
            time: 0,
            input: '',
            running: false,
            shouldPlaySound: false
        };
    },
    mounted() {
        this.bannerBlink();

        $('#modal').on('hide.bs.modal', e => {
            this.shouldPlaySound = false;
        });
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
        onEnd() {
            this.shouldPlaySound = true;
            $('#modal').modal();
        },
        onReset() {
            this.running = false;
            this.input = '';
            this.time = 0;
        },
        bannerBlink() {
            $('#alertHeading').fadeOut(1000)
                .fadeIn(1000);
        },
        onKeyDown(event) {
            let keyVal;

            if (!this.running && event.key && (keyVal = event.key.trim()) && !isNaN(keyVal = Number(keyVal))) {
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
                <div :class="{'d-none':running}" class="text-center alert alert-info">
                    <h1 class="" id="alertHeading">Start entering figures to set the timer</h1>
                    <audio-list :active="shouldPlaySound"></audio-list>
                </div>
            </div>
            <watch :allowed="allowed" :timing="time" :clockwise="false" @reset="onReset" @start="onStart" @end="onEnd" @keydown="onKeyDown">    
                <div :title="running ? '': 'Start entering figures to set the timer'" slot-scope="scope">
                    <span>{{ scope.text }}</span>
                </div>
            </watch>
            <div class="modal fade" id="modal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header alert alert-info">
                            <h2 class="modal-title">Time is over</h2>
                            <button type="button" class="close" data-dismiss="modal">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body text-primary">
                            <p>Close the window to set timer again</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
};