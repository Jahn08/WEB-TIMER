import banner from '/components/banner.js';

const cardSection = {
    props: {
        header: {
            required: true,
            type: String
        }
    },
    template: `
        <div class="card border-info">
            <h2 class="card-header">{{ header }}</h2>
            <div class="card-body">
                <slot></slot>
            </div>
        </div>`
};

const userTimers = {
    components: {
        banner,
        cardSection
    },
    data() {
        return {
            curProgram: null,
            curStage: null,
            programs: [{
                    id: 1,
                    name: 'Test program',
                    active: true,
                    stages: [{
                        order: 0,
                        duration: 5000,
                        descr: 'First stage with rather a long description which should be cut to not look ugly on the timer form'
                    }, {
                        order: 1,
                        duration: 3000,
                        descr: 'Merely the second stage'
                    }, {
                        order: 2,
                        duration: 3000,
                        descr: 'The final step'
                    }]
                }, {
                    id: 2,
                    name: 'Roasting peanuts in oven',
                    active: false,
                    stages: [{
                        order: 0,
                        duration: 30000,
                        descr: 'Heat an oven'
                    }, {
                        order: 1,
                        duration: 300000,
                        descr: 'Roast firstly'
                    }, {
                        order: 2,
                        duration: 10000,
                        descr: 'Stir it up'
                    }, {
                        order: 3,
                        duration: 300000,
                        descr: 'Roast secondly'
                    }, {
                        order: 4,
                        duration: 10000,
                        descr: 'Stir it up'
                    }, {
                        order: 5,
                        duration: 300000,
                        descr: 'Final roasting'
                    }, {
                        order: 6,
                        duration: 300000,
                        descr: 'Let it ripen with the oven turned off'
                    }]
                }]
        };
    },
    mounted() {
        let $programListObj = this.getProgramListJQuerySelector();

        $programListObj.multipleSelect({
            filter: true,
            single: true,
            allSelected: false
        });

        $programListObj.change((event) => this.onProgramChange($(event.target)));
        this.onProgramChange($programListObj);
    },
    computed: {
        noSelectedStage() {
            return !this.curStage;
        },
        curProgramAvailableStages() {
            return this.curProgramAllStages.filter(a => a.order >= 0);
        },
        curProgramAllStages() {
            return this.curProgram ? this.curProgram.stages.sort((a, b) => a.order > b.order) : [];
        }
    },
    methods: {
        getProgramListJQuerySelector() {
            return $('#programs');
        },
        onProgramChange($programListObj) {
            let selectedVal = $programListObj.multipleSelect('getSelects')[0];
            this.setCurrentProgram(this.programs.find(val => val.id == selectedVal));
        },
        setCurrentProgram(newProgram) {
            if (!newProgram)
                this.curProgram = null;
            else if (!this.curProgram || newProgram.id != this.curProgram.id) {
                this.convertDurationToSeconds(newProgram);
                this.curProgram = newProgram;

                this.switchCurrentStage(this.getActiveStageOnForm(this.curProgram));
            }
        },
        convertDurationToSeconds(program) {
            if (!program.inSeconds) {
                program.stages.forEach(val => val.duration /= 1000);
                program.inSeconds = true;
            }
        },
        getActiveStageOnForm(program) {
            if (!program || !program.stages)
                return;

            let $activeStage = $('#stages .active');

            if ($activeStage.length === 0)
                return;

            return program.stages[$activeStage.attr('id')];
        },
        convertDurationToMilliseconds(program) {
            if (program.inSeconds) {
                program.stages.forEach(val => val.duration *= 1000);
                program.inSeconds = false;
            }
        },
        moveStageUp() {
            this.alterStageOrderBy(this.curStage, -1);
        },
        moveStageDown() {
            this.alterStageOrderBy(this.curStage, 1);
        },
        alterStageOrderBy(stage, number) {
            if (stage) {
                let oldOrder = stage.order;
                let newOrder = oldOrder + number;

                let stages = this.curProgramAvailableStages;
                let upperLimit = stages.length;

                if (newOrder >= 0 && newOrder < upperLimit) {
                    stages[newOrder].order = oldOrder;
                    stage.order = newOrder;
                }
            }
        },
        deleteStage() {
            if (this.curStage) {
                let stages = this.curProgramAvailableStages;
                for (let i = this.curStage.order + 1; i < stages.length; ++i) {
                    stages[i].order -= 1;
                }

                this.curStage.order = -1;
                this.switchCurrentStage(null);
            }
        },
        switchCurrentStage(newStage) {
            if (this.curProgram)
                this.curStage = this.curStage == newStage ? null : newStage;
        },
        addStage() {
            let stages = this.curProgramAllStages;

            if (stages)
            {
                let stageOrder = this.curProgramAvailableStages.length;

                stages.push(this.curStage = {
                    order: stageOrder,
                    duration: 1,
                    descr: `New stage ${stageOrder + 1}`
                });
            }
        },
        addProgram() {
            const programCount = this.programs.length;
            const tempId = (programCount > 0 ? this.programs[programCount - 1].id : 0) + 1;

            this.programs.push({
                id: tempId,
                name: `New timer program ${tempId}`,
                active: false,
                stages: []
            });

            this.$nextTick(() => {
                this.refreshProgramList();
                this.selectProgramOnList(tempId);
            });
        },
        refreshProgramList() {
            this.getProgramListJQuerySelector().multipleSelect('refresh');
        },
        selectProgramOnList(programId) {
            this.getProgramListJQuerySelector().multipleSelect('setSelects', [programId]);
        },
        deleteProgram() {
            if (this.curProgram) {
                this.programs = this.programs.filter(p => p.id != this.curProgram.id);

                this.$nextTick(() => {
                    this.refreshProgramList();
                });
            }
        }
    },
    template: `
        <div>
            <banner heading="User Timers"></banner>
            <div class="container">
                <div class="row">
                    <div class="col-3">
                        <div class="btn-group" role="group" aria-label="Actions for Timer Programs">
                            <button title="Add Program" @click="addProgram()" type="button" class="btn btn-info">&#43</button>
                            <button title="Remove Program" @click="deleteProgram()"  type="button" class="btn btn-info">&#x2717</button>
                            <button title="Save All Changes" type="button" class="btn btn-info">&#128190</button>
                        </div>
                        <select id="programs" class="form-control">
                            <option v-for="pr in programs" :value="pr.id">{{ pr.name }}</option>
                        </select>
                    </div>
                    <div class="col-1"></div>
                    <div class="col-8" v-if="curProgram">
                        <card-section header="Basic Info">
                            <div class="form-group row">
                                <label class="col-2 col-form-label" for="timerNameTxt">Name</label>
                                <div>
                                    <input type="text" class="form-control" id="timerNameTxt" @focusout="refreshProgramList()" v-model="curProgram.name" />
                                </div>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" id="timerActiveCheck" type="checkbox" v-model="curProgram.active" />
                                <label class="form-check-label" for="timerActiveCheck">Active</label>
                            </div>
                        </card-section>
                        <card-section header="Stages">
                            <div class="btn-group" role="group" aria-label="Actions for Stages">
                                <button :disabled="noSelectedStage" @click="moveStageUp()" title="Move Stage Up" type="button" class="btn btn-info">&#x21a5</button>
                                <button :disabled="noSelectedStage" @click="moveStageDown()" title="Move Stage Down" type="button" class="btn btn-info">&#x21a7</button>
                                <button :disabled="noSelectedStage" @click="deleteStage()" title="Remove Stage" type="button" class="btn btn-info">&#x2717</button>
                                <button title="Add Stage" @click="addStage()" type="button" class="btn btn-info">&#43</button>
                            </div>
                            <div class="row">
                                <div class="col-4">
                                    <div class="list-group" id="stages">
                                        <a v-for="st, i in curProgramAvailableStages" :id="i" @click="switchCurrentStage(st)" :class='{ "active": curStage == st }' class="list-group-item list-group-item-action" :href="'#stage' + i" data-toggle="list" :title="st.descr">Stage {{ st.order + 1 }}</a>
                                    </div>
                                </div>
                                <div class="col-8">
                                    <div class="tab-content">
                                        <div v-for="st, i in curProgramAvailableStages" class="tab-pane fade show" :class='{ "active": curStage == st }' :id="'stage' + i">
                                            <div class="form-group row">
                                                <label class="col-5 col-form-label" for="timerDurationNum">Duration (sec)</label>
                                                <div>
                                                    <input type="number" class="form-control" id="timerDurationNum" v-model="st.duration" />
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-5 col-form-label" for="timerDescriptionTxt">Description</label>
                                                <div>
                                                    <textarea class="form-control" id="timerDescriptionTxt" v-model.lazy="st.descr"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </card-section>
                    </div>
                </div>
            </div>
        </div>`
};

export default userTimers;