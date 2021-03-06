﻿import banner from './banner.js';
import authListener from './auth-listener.js';
import RouteFormState from './route-form-state.js';
import { ProgramApi, ProgramUpdater } from './api.js';
import { cardSection } from './bootstrap-controls.js';

const userTimers = {
    components: {
        banner,
        cardSection,
        authListener
    },
    props: {
        authSettings: null
    },
    data() {
        return {
            curProgram: null,
            curStage: null,
            programs: [],
            authToken: null,
            api: new ProgramApi(),
            progUpdater: null,
            restrictions: {
                name: {
                    maxlength: 0
                },
                stages: {
                    duration: {
                        max: 0,
                        min: 0
                    },
                    descr: {
                        maxlength: 0
                    }
                }
            },
            hasError: false,
            saving: false,
            routeFormState: RouteFormState.constructFromScope(this),
            isDirty: false
        };
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
        },
        durationMinLimit() {
            return this.restrictions.stages.duration.min;
        },
        durationMaxLimit() {
            return this.restrictions.stages.duration.max;
        },
        stageDescrMaxLength() {
            return this.restrictions.stages.descr.maxlength;
        }
    },
    methods: {
        onAuthenticationChange(authToken) {
            this.authToken = authToken;
            this.getUserProgramsFromServer();
        },
        getUserProgramsFromServer() {
            if (this.authToken)
                this.api.getUserPrograms(this.authToken)
                    .then(resp => this.initialiseProgramList(resp)).catch(alert);
        },
        initialiseProgramList(response) {
            this.setCurrentProgram();

            this.programs = response.programs;
            this.progUpdater = new ProgramUpdater(this.programs);

            this.restrictions = response.schemaRestrictions;

            this.$nextTick(() => {
                const $programListObj = this.getProgramListJQuerySelector();

                $programListObj.multipleSelect({
                    filter: true,
                    single: true,
                    allSelected: false,
                    onFocus: this.onOpeningProgramList
                });

                $programListObj.change((event) => this.onProgramChange($(event.target)));
                this.onProgramChange($programListObj);
            });
        },
        getProgramListJQuerySelector() {
            return $('#programs');
        },
        onOpeningProgramList()
        {
            if (!this.hasError)
                this.getProgramListJQuerySelector().multipleSelect('enable');
            else
                this.getProgramListJQuerySelector().multipleSelect('disable');
        },
        onProgramChange($programListObj) {
            const selectedVal = $programListObj.multipleSelect('getSelects')[0];
            this.setCurrentProgram(this.programs.find(val => val._id == selectedVal));
        },
        setCurrentProgram(newProgram) {
            if (!newProgram)
                this.curProgram = null;
            else if (!this.curProgram || newProgram._id != this.curProgram._id) {
                this.curProgram = newProgram;

                this.switchCurrentStage(this.getActiveStageOnForm(this.curProgram));
            }
        },
        getActiveStageOnForm(program) {
            if (!program || !program.stages)
                return;

            const $activeStage = $('#stages .active');

            if ($activeStage.length === 0)
                return;

            return program.stages[$activeStage.attr('id')];
        },
        moveStageUp() {
            this.alterStageOrderBy(this.curStage, -1);
        },
        moveStageDown() {
            this.alterStageOrderBy(this.curStage, 1);
        },
        alterStageOrderBy(stage, number) {
            if (stage) {
                const oldOrder = stage.order;
                const newOrder = oldOrder + number;

                const stages = this.curProgramAvailableStages;
                const upperLimit = stages.length;

                if (newOrder >= 0 && newOrder < upperLimit) {
                    stages[newOrder].order = oldOrder;
                    stage.order = newOrder;
                }

                this.markProgramUpdated();
            }
        },
        markProgramUpdated() {
            this.progUpdater.markUpdated(this.curProgram);
            this.makeFormDirty();
        },
        makeFormDirty() {
            this.routeFormState.makeDirty();
            this.isDirty = true;
        },
        deleteStage() {
            if (this.curStage) {
                const stages = this.curProgramAvailableStages;
                for (let i = this.curStage.order + 1; i < stages.length; ++i) {
                    stages[i].order -= 1;
                }

                if (stages.length === 1 && this.curProgram)
                    this.curProgram.active = false;

                this.curStage.order = -1;
                this.switchCurrentStage();

                this.markProgramUpdated();
            }
        },
        switchCurrentStage(newStage, event) {
            if (!this.hasError)
                this.curStage = this.curStage == newStage ? null : newStage;
            else
                this.stopEvent(event);
        },
        stopEvent(event) {
            if (event)
            {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        addStage() {
            const stages = this.curProgramAllStages;

            if (stages)
            {
                const stageOrder = this.curProgramAvailableStages.length;

                stages.push(this.curStage = {
                    order: stageOrder,
                    duration: 1,
                    descr: `New stage ${stageOrder + 1}`
                });

                this.markProgramUpdated();
            }
        },
        addProgram() {
            const programCount = this.programs.length;
            const tempId = programCount + 1;

            this.programs.push({
                _id: tempId,
                name: `New timer program ${tempId}`,
                active: false,
                stages: []
            });

            this.makeFormDirty();
            
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
                this.programs = this.programs.filter(p => p._id != this.curProgram._id);

                this.$nextTick(() => {
                    this.refreshProgramList();
                });

                this.makeFormDirty();
            }
        },
        saveChanges() {
            this.programs.forEach(p => {
                p.stages = p.stages.filter(s => s.order !== -1);
            });
            
            if (this.validateFormData()) {
                this.startSaving();

                this.api.saveUserPrograms(this.authToken, this.progUpdater.getQueryData(this.programs))
                    .then(resp => {
                        this.finishSaving();
                        this.initialiseProgramList(resp);

                        this.makeFormPure();
                    })
                    .catch(err => {
                        alert(err);
                        this.finishSaving();
                    });
            }
        },
        makeFormPure() {
            this.routeFormState.makePure();
            this.isDirty = false;
        },
        startSaving() {
            this.saving = true;
        },
        finishSaving() {
            this.saving = false;
        },
        validateFormData() {
            this.hasError = false;

            if (this.curProgram) {      
                if (!this.curProgram.name)
                    this.hasError = true;

                if (this.curStage) {
                    if (!this.curStage.descr)
                        this.hasError = true;

                    const duration = this.curStage.duration;
                    if (duration < this.durationMinLimit || duration > this.durationMaxLimit)
                        this.hasError = true;
                }
            }
            
            return !this.hasError;
        },
        onProgramNameCtrlFocusOut() {
            this.onCtrlFocusOut();
            this.refreshProgramList();
        },
        onCtrlFocusOut() {
            this.validateFormData();
        }
    },
    template: `
        <div>
            <banner heading="User Timers"></banner>
            <auth-listener @change="onAuthenticationChange">
                <div v-if="saving">Please wait...</div>
                <div v-else class="container">
                    <div class="row">
                        <div class="col-3">
                            <div class="btn-group" role="group" aria-label="Actions for Timer Programs">
                                <button :disabled="hasError" title="Add Program" @click="addProgram()" type="button" class="btn btn-info">&#43</button>
                                <button :disabled="hasError" title="Remove Program" @click="deleteProgram()"  type="button" class="btn btn-info">&#x2717</button>
                                <button :disabled="hasError || !isDirty" title="Save All Changes" @click="saveChanges()" type="button" class="btn btn-info">&#128190</button>
                            </div>
                            <select id="programs" class="form-control">
                                <option v-for="pr in programs" :value="pr._id">{{ pr.name }}</option>
                            </select>
                        </div>
                        <div class="col-1"></div>
                        <div class="col-8" v-if="curProgram" :class="{ 'was-validated': hasError }">
                            <card-section header="Basic Info">
                                <div class="form-group row">
                                    <label class="col-2 col-form-label" for="timerNameTxt">Name</label>
                                    <div>
                                        <input type="text" class="form-control" :maxlength="restrictions.name.maxlength" required id="timerNameTxt" @focusout="onProgramNameCtrlFocusOut" v-model="curProgram.name" @change="markProgramUpdated" />
                                        <div class="invalid-feedback">Please provide a program name</div>
                                    </div>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" id="timerActiveCheck" type="checkbox" v-model="curProgram.active" @change="markProgramUpdated" :disabled="!curProgramAvailableStages.length" />
                                    <label class="form-check-label" for="timerActiveCheck">Active</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" id="audioBetweenStagesCheck" type="checkbox" v-model="curProgram.audioBetweenStages" @change="markProgramUpdated" />
                                    <label class="form-check-label" for="audioBetweenStagesCheck">Audio Between Stages</label>
                                </div>
                            </card-section>
                            <card-section header="Stages">
                                <div class="btn-group" role="group" aria-label="Actions for Stages">
                                    <button :disabled="noSelectedStage" @click="moveStageUp()" title="Move Stage Up" type="button" class="btn btn-info">&#x21a5</button>
                                    <button :disabled="noSelectedStage" @click="moveStageDown()" title="Move Stage Down" type="button" class="btn btn-info">&#x21a7</button>
                                    <button :disabled="noSelectedStage || hasError" @click="deleteStage()" title="Remove Stage" type="button" class="btn btn-info">&#x2717</button>
                                    <button :disabled="hasError" title="Add Stage" @click="addStage()" type="button" class="btn btn-info">&#43</button>
                                </div>
                                <div class="row">
                                    <div class="col-4">
                                        <div class="list-group" id="stages">
                                            <a v-for="st, i in curProgramAvailableStages" :id="i" @click="switchCurrentStage(st, $event)" :class='{ "active": curStage == st }' class="list-group-item list-group-item-action" :href="'#stage' + i" data-toggle="list" :title="st.descr">Stage {{ st.order + 1 }}</a>
                                        </div>
                                    </div>
                                    <div class="col-8">
                                        <div class="tab-content">
                                            <div v-for="st, i in curProgramAvailableStages" class="tab-pane fade show" :class='{ "active": curStage == st }' :id="'stage' + i">
                                                <div class="form-group row">
                                                    <label class="col-5 col-form-label" for="timerDurationNum">Duration (sec)</label>
                                                    <div>
                                                        <input :max="durationMaxLimit" :min="durationMinLimit" type="number" class="form-control" id="timerDurationNum" v-model="st.duration" @change="markProgramUpdated" @focusout="onCtrlFocusOut" required />
                                                        <div class="invalid-feedback">A duration must be from {{ durationMinLimit }} to {{ durationMaxLimit }} seconds</div>
                                                    </div>
                                                </div>
                                                <div class="form-group row">
                                                    <label class="col-5 col-form-label" for="timerDescriptionTxt">Description</label>
                                                    <div>
                                                        <textarea class="form-control" id="timerDescriptionTxt" v-model.lazy="st.descr" @focusout="onCtrlFocusOut" @change="markProgramUpdated" required :maxlength="stageDescrMaxLength"></textarea>
                                                        <div class="invalid-feedback">Please provide a program stage name</div>
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
            </auth-listener>
        </div>`
};

export default userTimers;