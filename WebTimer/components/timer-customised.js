Components.stageSwitch = {
    data() {
        return {
            tabs: [],
            curIndex: -1,
            output: ''
        };
    },
    props: {
        stages: {
            type: Array,
            required: true
        },
        curStage: {
            type: Number
        },
        text: {
            type: String,
            required: true
        }
    },
    watch: {
        text() {
            this.output = this.text;
        },
        curStage() {
            if (this.curStage > 0)
                this.curIndex = this.curStage;
            else
                this.onSwitch(0);
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.renderTabs();
        });
    },
    computed: {
        disabled() {
            return this.curStage > 0;
        }
    },
    methods: {
        renderTabs() {
            if (this.stages) {
                this.tabs = this.stages.map(v => v.text);
                this.$nextTick(() => this.onSwitch(0));
            }
        },
        onSwitch(index) {
            if (!this.disabled) {
                this.curIndex = index;
                this.output = this.tabs[index];
            }
        }
    },
    template: `
        <span>
            <span>{{ output }}</span>
            <div class="stages" :class="{ 'disabled': disabled }">
                <span v-for="t, index in tabs" :class="{ 'active': curIndex == index }" :title="t" @click="onSwitch(index)">{{ index === 0 ? 'all': index }}</span>
            </div>
        </span>`
};

Components.timerCustomised = {
    components: {
        'watch': Components.watch,
        'audioList': Components.audioList,
        'banner': Components.banner,
        'stage-switch': Components.stageSwitch
    },
    data() {
        return {
            isRun: false,
            shouldPlaySound: false,
            inputMsTime: 0,
            tipText: 'Select a timer template from the list',
            switchStages: [],
            stagesInMs: [],
            curStage: 0,
            switchStage: 0
        };
    },
    mounted() {
        this.bannerBlink();

        $('#modal').on('hide.bs.modal', e => {
            this.shouldPlaySound = false;
        });

        this.initialiseStages();
    },
    methods: {
        initialiseStages() {
            this.stagesInMs = [3000, 2000];
        },
        configureStages(stageArray, allTime, allTimeText) {
            if (stageArray) {
                this.switchStages = [{ time: allTime, text: allTimeText }].concat(stageArray.map((val, i) => {
                    return { time: this.stagesInMs[i], text: val };
                }));

                this.$nextTick(() => this.updateSwitchStage(this.curStage = 0));
            }
        },
        onStart(event) {
            if (!event.allowedToRun)
                this.bannerBlink();
            else {
                this.isRun = true;

                if (this.curStage == 0)
                    this.updateSwitchStage(this.curStage = 1);
            }
        },
        onEnd(hasNextStage) {
            if (!hasNextStage) {
                this.shouldPlaySound = true;
                $('#modal').modal();
            }
            else
                this.updateSwitchStage(++this.curStage);
        },
        onReset() {
            this.isRun = false;
        },
        bannerBlink() {
            $('#alertHeading').fadeOut(1000)
                .fadeIn(1000);
        },
        updateSwitchStage(stage) {
            this.switchStage = this.switchStage == stage ? --stage: stage;
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
            <watch :msStageArray="stagesInMs" @stageInitialised="configureStages" :clockwise="false" @reset="onReset" @start="onStart" @end="onEnd" :inputMsTime='inputMsTime'>    
                <div :title="isRun ? '': tipText" slot-scope="scope">
                    <span><stage-switch :stages="switchStages" :text="scope.text" :curStage="switchStage"></stage-switch></span>
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