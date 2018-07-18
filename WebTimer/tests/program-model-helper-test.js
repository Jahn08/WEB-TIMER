const assert = require('assert');

const mock = require('./infrastructure/mock');
const randomiser = require('./infrastructure/randomiser');
const expectation = require('./infrastructure/expectation');

const Program = require('../models/program');
const ProgramModelHelper = require('../tools/db-model-helpers').ProgramModelHelper;

const mongoose = require('mongoose')
const generateObjectId = () => mongoose.Types.ObjectId();

describe('ProgramModelHelper', function () {
    let dbConnector;

    before(() => {
        const DbConnector = require('./infrastructure/db-connector').DbConnector;
        dbConnector = new DbConnector();
    });

    after(() => dbConnector.disconnect());

    this.timeout(5000);

    const createTestProgramModel = (userId) => {
        return new Program({
            name: 'TEST',
            stages: [],
            userId
        });
    };

    const createTestProgram = () => {
        const newProgramName = randomiser.getRandomIntUpToMaxInteger().toString();
        const newProgramStageDescr = randomiser.getRandomIntUpToMaxInteger().toString();

        return {
            name: newProgramName,
                stages: [{ order: 0, duration: 1000, descr: newProgramStageDescr }]
        };
    };

    const getString = (obj) => obj ? obj.toString() : '';

    const usingTestProgramModels = function (callback) {
        const userId = generateObjectId();
        const anotherUserId = generateObjectId();

        return new Promise((resolve, reject) => {
            const newPrograms = [createTestProgramModel(userId), createTestProgramModel(userId), createTestProgramModel(anotherUserId)];
            Program.create(newPrograms, (err, programs) => {
                assert(!err, 'An error while creating test programs: ' + getString(err));
                assert.equal(programs.length, 3);

                const removeItemsAndFinish = respErr => Program.remove({ userId: { $in: [userId, anotherUserId] } }, err => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(!err, 'An error while removing test programs: ' + getString(err));

                        if (respErr)
                            throw new Error(respErr.toString());
                    });
                });

                callback(userId)
                    .then(removeItemsAndFinish)
                    .catch(removeItemsAndFinish);
            });
        });
    };

    it('should cause an error when trying to build the object without passing the response argument', () => {
        expectation.expectError(() => {
            const programModelHelper = new ProgramModelHelper();
        });
    });

    describe('#findUserPrograms', () => {
        it('should return a user\'s programs', () => {
            const mockedResponse = mock.mockResponse();
            const programModelHelper = new ProgramModelHelper(mockedResponse);

            const callback = (userId) => {
                return new Promise((resolve, reject) => {
                    programModelHelper.findUserPrograms(userId).then(programs => {
                        expectation.tryCatchForPromise(resolve, reject, () => {
                            assert(programs && programs.length === 2);

                            const strUserId = userId.toString();
                            assert.equal(programs.filter(p => p.userId.toString() === strUserId).length, 2);
                        });
                    }).catch(err => reject(err));
                });
            };

            return usingTestProgramModels(callback);
        });

        it('should return an empty list of programs', () => {
            const mockedResponse = mock.mockResponse();
            const programModelHelper = new ProgramModelHelper(mockedResponse);
            const userId = generateObjectId();

            return new Promise((resolve, reject) => {
                programModelHelper.findUserPrograms(userId).then(programs =>
                    expectation.tryCatchForPromise(resolve, reject, () => assert(programs && !programs.length)))
                    .catch(err => reject(err));
            });
        });
    });

    describe('#updateProgram', () => {
        it('should update a program successfully', () => {
            const mockedResponse = mock.mockResponse();
            const programModelHelper = new ProgramModelHelper(mockedResponse);

            const callback = (userId) => {
                return new Promise((resolve, reject) => {
                    programModelHelper.findUserPrograms(userId).then(programs => {
                        expectation.tryCatchForPromise(resolve, reject, () => {
                            assert(programs && programs.length > 0);

                            const programForUpdate = programs[0];
                            const newProgramData = createTestProgram();

                            programModelHelper.updateProgram(programForUpdate, newProgramData).then(updatedProgram => {
                                expectation.tryCatchForPromise(resolve, reject, () => {
                                    assert(updatedProgram);
                                    assert.equal(updatedProgram.name, newProgramData.name);

                                    assert(updatedProgram.stages && updatedProgram.stages.length === 1);
                                    assert.equal(updatedProgram.stages[0].descr, newProgramData.stages[0].descr);
                                });
                            }).catch(err => reject(err));
                        });
                    }).catch(err => reject(err));
                });
            };

            return usingTestProgramModels(callback);
        });

        it('should accept empty program data and update the fields with default values', () => {
            const mockedResponse = mock.mockResponse();
            const programModelHelper = new ProgramModelHelper(mockedResponse);

            const callback = (userId) => {
                return new Promise((resolve, reject) => {
                    programModelHelper.findUserPrograms(userId).then(programs => {
                        expectation.tryCatchForPromise(resolve, reject, () => {
                            assert(programs && programs.length > 0);

                            const programForUpdate = programs[0];
                            const newProgramData = createTestProgram();

                            programModelHelper.updateProgram(programForUpdate, newProgramData).then(updatedProgram => {
                                programModelHelper.updateProgram(updatedProgram).then(_updatedProgram => {
                                    expectation.tryCatchForPromise(resolve, reject, () => {
                                        assert(_updatedProgram);
                                        assert.equal(_updatedProgram.name, newProgramData.name);

                                        assert(_updatedProgram.stages.length === 0);
                                    });
                                }).catch(err => reject(err));
                            }).catch(err => reject(err));
                        });
                    }).catch(err => reject(err));
                });
            };

            return usingTestProgramModels(callback);
        });
    });

    describe('#createPrograms', () => {

        const createPrograms = (newPrograms, onResolve) => {
            return new Promise((resolve, reject) => {
                const mockedResponse = mock.mockResponse();
                const programModelHelper = new ProgramModelHelper(mockedResponse);

                const userId = generateObjectId();

                programModelHelper.createPrograms(newPrograms, userId).then(createdPrograms => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(createdPrograms);
                        onResolve(createdPrograms, userId);
                    });
                }).catch(err => reject(err));
            });
        };

        it('should create a list of passed programs for a user', () => {
            const newPrograms = [createTestProgram(), createTestProgram()];

            return createPrograms(newPrograms, (createdPrograms, userId) => {
                assert.equal(createdPrograms.length, newPrograms.length);

                assert(newPrograms.filter(p => createdPrograms.find(cp => cp.userId === userId &&
                    p.name === cp.name &&
                    p.stages.length === cp.stages.length &&
                    p.stages[0].descr === cp.stages[0].descr)).length === newPrograms.length);
            });
        });

        it('should accept an undefined list of programs and create nothing', () => {
            return createPrograms(undefined, (createdPrograms) => {
                assert.equal(createdPrograms.length, 0);
            });
        });

        it('should accept an empty list of programs and create nothing', () => {
            return createPrograms([], (createdPrograms) => {
                assert.equal(createdPrograms.length, 0);
            });
        });

        it('should cause an error when accepting an undefined user id', () => {
            const mockedResponse = mock.mockResponse();
            const programModelHelper = new ProgramModelHelper(mockedResponse);

            return expectation.expectRejection(() => programModelHelper.createPrograms([{ name: 'some program' }]));
        });
    });

    describe('#reduceProgramsToList', () => {
        it('should reduce the first list of programs whose ids are not in the second list');

        it('should accept an empty list of programs and resolve with the first passed argument');

        it('should accept an undefined list of programs and resolve with the first passed argument');

        it('should accept an empty list for reduction and resolve with the first passed argument');

        it('should accept an undefined list for reduction and resolve with the first passed argument');

        it('should be run with undefined parameters and resolve with the first passed argument');

        it('should return an empty list of programs');
    });
});