import watch from '/components/watch.js';
import audioList from '/components/audio-list.js';
import banner from '/components/banner.js';

const stageSwitch = {
    data() {
        return {
            tabs: [],
            curIndex: -1,
            output: '',
            fullDescription: null
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
        },
        stages() {
            this.renderTabs();
        }
    },
    computed: {
        disabled() {
            return this.curStage > 0;
        },
        description() {
            let obj = this.tabs[this.curIndex];
            let descr;

            if (!obj || !(descr = obj.descr))
                return null;

            const descrLimitation = 47;

            if (descr.length > descrLimitation) {
                this.fullDescription = descr;
                return descr.substr(0, descrLimitation) + '...';
            }

            this.fullDescription = null;
            return descr;
        }
    },
    methods: {
        renderTabs() {
            if (this.stages && this.stages.length) {
                this.tabs = this.stages.slice();
                this.$nextTick(() => this.onSwitch(0));
            }
        },
        onSwitch(index) {
            if (!this.disabled) {
                this.curIndex = index;
                this.output = this.tabs[index].text;
            }
        }
    },
    template: `
        <span>
            <div :title='fullDescription' class="stageDescription">{{ description }}</div>
            <span>{{ output }}</span>
            <div class="stages" :class="{ 'disabled': disabled }">
                <span v-for="t, index in tabs" :class="{ 'active': curIndex == index }" :title="t.text" @click="onSwitch(index)">{{ index === 0 ? 'all': index }}</span>
            </div>
        </span>`
};

const timerCustomised = {
    components: {
        watch,
        audioList,
        banner,
        stageSwitch
    },
    data() {
        return {
            isRun: false,
            shouldPlaySound: false,
            inputMsTime: 0,
            tipText: 'Select a timer program from the list',
            switchStages: [], // stages for storing text time obtained from the watch
            stagesInMs: [], // stages for setting up the watch
            stageDescr: [],
            curStage: 0, // an actual stage
            switchStage: 0, // a stage for the switcher
            programNames: [],
            programs: [],
            programTitle: ''
        };
    },
    mounted() {
        this.bannerBlink();

        $('#modal').on('hide.bs.modal', e => {
            this.shouldPlaySound = false;
        });

        this.initialiseTemplateList();
    },
    methods: {
        initialiseTemplateList() {
            $.ajax('/programs/default')
                .then(res => {
                    this.programs = res;
                    this.programNames = res.sort((a, b) => a.name > b.name)
                        .map((val, i) => { return { name: val.name, id: i }; });

                    if (this.programs.length)
                        this.renderProgram(this.programs[0]);
                })
                .catch(err => alert('An error has occured while getting a list of default timer programs available: ' + err));
        },
        changeProgram(event) {
            let obj;
            let program;

            if (!event || !(obj = event.target) || !(program = this.programs[obj.value])) {
                alert('The selected program is corupted and cannot be rendered');
                return;
            }

            this.renderProgram(program);
        },
        renderProgram(program) {
            if (!program.stages || program.stages.length === 0) {
                alert('The selected program does not contain any stages and therefore cannot be rendered');
                return;
            }

            let orderedStages = program.stages.sort((a, b) => a.order > b.order);

            this.stageDescr = orderedStages.map(val => val.descr);
            this.stagesInMs = orderedStages.map(val => val.duration);

            this.programTitle = program.name;
        },
        configureStages(stageArray, allTimeText) {
            if (stageArray) {
                this.switchStages = [{ text: allTimeText }].concat(stageArray.map((val, i) => {
                    return { descr: this.stageDescr[i], text: val };
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
            <banner heading="Timer With Stages">
                <hr/>
                <div class="text-center">
                    <h2 :class="{'d-none':!isRun}">{{ programTitle }}</h2>
                    <div :class="{'d-none':isRun}">
                        <h2 id="alertHeading">{{ tipText }}</h2>
                        <select @change="changeProgram" class="text-primary">
                            <option v-for="p in programNames" :value="p.id">{{ p.name }}</option>
                        </select>
                        <audio-list :active="shouldPlaySound"></audio-list>
                    </div>
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

export default timerCustomised;