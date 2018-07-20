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

    this.timeout(7000);

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
            _id: generateObjectId(),
            name: newProgramName,
            stages: [{ _id: generateObjectId(), order: 0, duration: 1000, descr: newProgramStageDescr }]
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
                assert.strictEqual(programs.length, 3);

                const removeItemsAndFinish = respErr => Program.remove({ userId: { $in: [userId, anotherUserId] } }, err => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(!err, 'An error while removing test programs: ' + getString(err));

                        if (respErr)
                            throw new Error(respErr.toString());
                    });
                });

                callback(userId, newPrograms)
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

    const initProgramModelHelper = () => {
        const mockedResponse = mock.mockResponse();
        return new ProgramModelHelper(mockedResponse);
    };

    describe('#findUserPrograms', () => {
        it('should return a user\'s programs', () => {
            const programModelHelper = initProgramModelHelper();

            const callback = (userId, newPrograms) => {
                return new Promise((resolve, reject) => {
                    programModelHelper.findUserPrograms(userId).then(programs => {
                        expectation.tryCatchForPromise(resolve, reject, () => {
                            const expectedLength = 2;
                            assert(programs && programs.length === expectedLength);

                            const strUserId = userId.toString();
                            assert.strictEqual(programs.filter(p => p.userId.toString() === strUserId).length, expectedLength);
                        });
                    }).catch(err => reject(err));
                });
            };

            return usingTestProgramModels(callback);
        });

        it('should return an empty list of programs', () => {
            const programModelHelper = initProgramModelHelper();
            const userId = generateObjectId();

            return new Promise((resolve, reject) => {
                programModelHelper.findUserPrograms(userId).then(programs =>
                    expectation.tryCatchForPromise(resolve, reject, () => assert(programs && !programs.length)))
                    .catch(err => reject(err));
            });
        });
    });

    describe('#updateProgram', () => {
        const updatePrograms = (afterProgramUpdated) => {
            const programModelHelper = initProgramModelHelper();

            const callback = (userId, newPrograms) => {
                return new Promise((resolve, reject) => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        const programForUpdate = newPrograms[0];
                        const newProgramData = createTestProgram();

                        programModelHelper.updateProgram(programForUpdate, newProgramData).then(updatedProgram => {
                            expectation.tryCatchForPromise(resolve, reject, () => {
                                assert(updatedProgram);

                                afterProgramUpdated(updatedProgram, newProgramData, resolve, reject);
                            });
                        }).catch(err => reject(err));
                    });
                });
            };

            return usingTestProgramModels(callback);
        };

        it('should update a program successfully', () => {
            return updatePrograms((updatedProgram, newProgramData) => {
                assert.strictEqual(updatedProgram.name, newProgramData.name);

                assert(updatedProgram.stages && updatedProgram.stages.length === 1);
                assert.strictEqual(updatedProgram.stages[0].descr, newProgramData.stages[0].descr);
            });
        });

        it('should accept empty program data and update the fields with default values', () => {
            return updatePrograms((updatedProgram, newProgramData, resolve, reject) => {
                programModelHelper.updateProgram(updatedProgram).then(_updatedProgram => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        assert(_updatedProgram);
                        assert.strictEqual(_updatedProgram.name, newProgramData.name);

                        assert(_updatedProgram.stages.length === 0);
                    });
                }).catch(err => reject(err));
            });
        });

    });

    describe('#createPrograms', () => {

        const createPrograms = (newPrograms, onResolve) => {
            return new Promise((resolve, reject) => {
                const programModelHelper = initProgramModelHelper();

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
                assert.strictEqual(createdPrograms.length, newPrograms.length);

                assert(newPrograms.filter(p => createdPrograms.find(cp => cp.userId === userId &&
                    p.name === cp.name &&
                    p.stages.length === cp.stages.length &&
                    p.stages[0].descr === cp.stages[0].descr)).length === newPrograms.length);
            });
        });

        it('should accept an undefined list of programs and create nothing', () => {
            return createPrograms(undefined, (createdPrograms) => {
                assert.strictEqual(createdPrograms.length, 0);
            });
        });

        it('should accept an empty list of programs and create nothing', () => {
            return createPrograms([], (createdPrograms) => {
                assert.strictEqual(createdPrograms.length, 0);
            });
        });

        it('should cause an error when accepting an undefined user id', () => {
            const programModelHelper = initProgramModelHelper();

            return expectation.expectRejection(() => programModelHelper.createPrograms([{ name: 'some program' }]));
        });

    });

    describe('#reduceProgramsToList', () => {

        const testReducingProgramListArguments = (programs, reductionList) => {
            const programModelHelper = initProgramModelHelper();
            
            return new Promise((resolve, reject) => {
                programModelHelper.reduceProgramsToList(programs, reductionList).then(resp =>
                    expectation.tryCatchForPromise(resolve, reject, () => assert.strictEqual(resp, programs)));
            });
        };

        it('should accept an empty list of programs and resolve with the first passed argument', () => {
            return testReducingProgramListArguments([], []);
        });

        it('should accept an undefined list of programs and resolve with the first passed argument', () => {
            return testReducingProgramListArguments(undefined, []);
        });

        it('should accept an empty list for reduction and resolve with the first passed argument', () => {
            const programs = [createTestProgram(), createTestProgram()];
            return testReducingProgramListArguments(programs, []);
        });

        it('should accept an undefined list for reduction and resolve with the first passed argument', () => {
            var programs = [createTestProgram(), createTestProgram()];
            return testReducingProgramListArguments(programs, []);
        });

        it('should be run with undefined parameters and resolve with undefined response', () => {
            return testReducingProgramListArguments();
        });

        it('should accept equal lists and return the same first list of programs', () => {
            const programModelHelper = initProgramModelHelper();

            const callback = (userId, newPrograms) => {
                return new Promise((resolve, reject) => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        programModelHelper.reduceProgramsToList(newPrograms, newPrograms).then(programs =>
                            expectation.tryCatchForPromise(resolve, reject, () => assert.strictEqual(programs, newPrograms)));
                    });
                });
            };

            return usingTestProgramModels(callback);
        });

        let testReducingProgramList = (getReductionList, onCheckingResult) => {
            const programModelHelper = initProgramModelHelper();

            const callback = (userId, newPrograms) => {
                return new Promise((resolve, reject) => {
                    expectation.tryCatchForPromise(resolve, reject, () => {
                        const firstProgram = newPrograms[0];
                        const secondProgram = newPrograms[1];
                        const thirdProgram = newPrograms[2];

                        const reductionList = getReductionList(newPrograms);

                        programModelHelper.reduceProgramsToList(newPrograms, reductionList).then(reducedPrograms =>
                            expectation.tryCatchForPromise(resolve, reject, () => {
                                assert(newPrograms && newPrograms.length === 3);

                                assert.deepStrictEqual(newPrograms[0], firstProgram);
                                assert.deepStrictEqual(newPrograms[1], secondProgram);
                                assert.deepStrictEqual(newPrograms[2], thirdProgram);

                                if (onCheckingResult)
                                    onCheckingResult(reducedPrograms);
                            }));
                    });
                });
            };

            return usingTestProgramModels(callback);
        };

        it('should reduce the first list of programs whose ids are not in the second list and keep passed arguments intact', () => {
            let reductionList;
            
            return testReducingProgramList(newPrograms => {
                let firstOtherProgram = createTestProgram();
                firstOtherProgram._id = newPrograms[0]._id;

                let secondOtherProgram = createTestProgram();
                secondOtherProgram._id = newPrograms[2]._id;

                return reductionList = [firstOtherProgram, secondOtherProgram];
            }, (reducedPrograms) => assert(reducedPrograms.filter(p => reductionList.find(pp => pp._id === p._id)).length === 2));
        });
        
        it('should reduce a list of programs towards emptiness without changing passed arguments', () => {
            let reductionList;

            return testReducingProgramList(() => { return reductionList = [createTestProgram(), createTestProgram()] },
                (reducedPrograms) => assert(reducedPrograms && reducedPrograms.length === 0));
        });

    });
});