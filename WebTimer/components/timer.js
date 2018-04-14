Components.timer = {
    components: {
        'watch': Components.watch,
        'audioList': Components.audioList,
        'banner': Components.banner,
        'time-switch': Components.timeSwitch
    },
    data() {
        return {
            running: false,
            shouldPlaySound: false,
            inputText: '',
            tipText: 'Start entering figures or use switches to set the timer'
        };
    },
    mounted() {
        this.bannerBlink();

        $('#modal').on('hide.bs.modal', e => {
            this.shouldPlaySound = false;
        });
    },
    methods: {
        onStart(event) {
            if (!event.allowedToRun)
                this.bannerBlink();
            else {
                this.running = true;
            }
        },
        onEnd() {
            this.shouldPlaySound = true;
            $('#modal').modal();
        },
        onReset() {
            this.running = false;
        },
        bannerBlink() {
            $('#alertHeading').fadeOut(1000)
                .fadeIn(1000);
        },
        onTextChange(newValue) {
            this.inputText = newValue;
        }
    },
    template: `
        <div>
            <banner heading="Timer">
                <div :class="{'d-none':running}" class="text-center">
                    <hr/>
                    <h2 id="alertHeading">{{ tipText }}</h2>
                    <audio-list :active="shouldPlaySound"></audio-list>
                </div>
            </banner>
            <watch :clockwise="false" @reset="onReset" @start="onStart" @end="onEnd" :inputText='inputText'>    
                <div :title="running ? '': tipText" slot-scope="scope">
                    <span v-if="!running"><time-switch @change='onTextChange' :text="scope.text"></time-switch></span>
                    <span v-else>{{ scope.text }}</span>
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