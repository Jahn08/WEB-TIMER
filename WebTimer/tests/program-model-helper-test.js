const assert = require('assert');

const mock = require('./infrastructure/mock');
const randomiser = require('./infrastructure/randomiser');
const expectation = require('./infrastructure/expectation');

const Program = require('../models/program');
const ProgramModelHelper = require('../tools/db-model-helpers').ProgramModelHelper;

const mongoose = require('mongoose');
const generateObjectId = () => mongoose.Types.ObjectId();

describe('ProgramModelHelper', function () {
    let dbConnector;

    before(() => {
        const DbConnector = require('./infrastructure/db-connector').DbConnector;
        dbConnector = new DbConnector();

        return dbConnector.connect();
    });

    after(() => {
        return new Promise((resolve, reject) => {
            Program.remove({}, err => {
                if (err)
                    reject(err);
                else
                    dbConnector.disconnect().then(() => resolve())
                        .catch(err => reject(err));
            });
        });
    });

    this.timeout(7000);

    const createTestProgramModel = (userId, active = false) => {
        return new Program({
            name: 'TEST',
            stages: [],
            userId,
            active
        });
    };

    const createTestProgram = () => {
        const newProgramName = randomiser.getRandomIntUpToMaxInteger().toString();
        const newProgramStageDescr = randomiser.getRandomIntUpToMaxInteger().toString();

        return {
            _id: generateObjectId(),
            name: newProgramName,
            audioBetweenStages: true,
            active: true,
            stages: [{ _id: generateObjectId(), order: 0, duration: 1000, descr: newProgramStageDescr }]
        };
    };

    const getString = (obj) => obj ? obj.toString() : '';

    const usingTestProgramModels = function (callback) {
        const userId = generateObjectId();
        const anotherUserId = generateObjectId();

        return new Promise((resolve, reject) => {
            const newPrograms = [createTestProgramModel(userId), createTestProgramModel(userId, true), createTestProgramModel(anotherUserId, true)];
            Program.create(newPrograms, (err, programs) => {
                assert(!err, 'An error while creating test programs: ' + getString(err));
                assert.strictEqual(programs.length, 3);

                const removeItemsAndFinish = respErr => Program.remove({ userId: { $in: [userId, anotherUserId] } }, err => {
                    expectation.tryCatchForPromise(reject, () => {
                        assert(!err, 'An error while removing test programs: ' + getString(err));

                        if (respErr)
                            throw new Error(respErr.toString());

                        resolve();
                    });
                });

                callback(userId, newPrograms)
                    .then(removeItemsAndFinish)
                    .catch(removeItemsAndFinish);
            });
        });
    };

    it('should cause an error when trying to build the object without passing the response argument', () =>
        expectation.expectError(() => new ProgramModelHelper(null, generateObjectId())));

    const initProgramModelHelper = (userId) => {
        const mockedResponse = mock.mockResponse();
        return new ProgramModelHelper(mockedResponse, userId || generateObjectId());
    };

    const assertProgramsAreInState = (programs, onlyActive) => {
        let haveActiveProgram;
        let haveInactiveProgram;

        programs.forEach(p => {
            if (p.active)
                haveActiveProgram = true;
            else
                haveInactiveProgram = true;
        });

        if (!onlyActive)
            assert(haveActiveProgram && haveInactiveProgram);
        else
            assert(haveActiveProgram && !haveInactiveProgram);
    };

    const testFindingUserPrograms = (searchingMethodName, onlyActive) => {

        const callback = (userId) => {
            return new Promise((resolve, reject) => {
                initProgramModelHelper(userId)[searchingMethodName]().then(programs => {
                    expectation.tryCatchForPromise(reject, () => {
                        const expectedLength = onlyActive ? 1 : 2;

                        const count = Number.parseInt(programs);

                        if (isNaN(count)) {
                            assert(programs && programs.length === expectedLength);

                            const strUserId = userId.toString();
                            assert.strictEqual(programs.filter(p => p.userId.toString() === strUserId).length, expectedLength);

                            assertProgramsAreInState(programs, onlyActive);
                        }
                        else {
                            assert(count === expectedLength);
                        }

                        resolve();
                    });
                }).catch(err => reject(err));
            });
        };

        return usingTestProgramModels(callback);
    };

    const testFindingWrongUserPrograms = (searchingMethodName) => {

        return new Promise((resolve, reject) => {
            initProgramModelHelper()[searchingMethodName]().then(programs =>
                expectation.tryCatchForPromise(reject, () => {
                    const count = Number.parseInt(programs);

                    if (isNaN(count))
                        assert(programs && !programs.length);
                    else
                        assert(count === 0);

                    resolve();
                }
                ))
                .catch(err => reject(err));
        });
    };

    const findUserProgramsMethodName = 'findUserPrograms';

    describe('#' + findUserProgramsMethodName, () => {
        it('should return a user\'s programs irrespective of them being active', () => 
            testFindingUserPrograms(findUserProgramsMethodName));

        it('should return an empty list of programs', () =>
            testFindingWrongUserPrograms(findUserProgramsMethodName));
    });

    const findUserActiveProgramsMethodName = 'findUserActivePrograms';

    describe('#' + findUserActiveProgramsMethodName, () => {
        it('should return a user\'s only active programs', () => {
            return testFindingUserPrograms(findUserActiveProgramsMethodName, true);
        });

        it('should return an empty list of programs', () => {
            return testFindingWrongUserPrograms(findUserActiveProgramsMethodName);
        });
    });

    const getNumberOfUserActiveProgramsMethodName = 'getNumberOfUserActivePrograms';

    describe('#' + getNumberOfUserActiveProgramsMethodName, () => {
        it('should return a number of user\'s only active programs', () => 
            testFindingUserPrograms(findUserActiveProgramsMethodName, true));

        it('should return a zero for a user not having any programs', () => 
            testFindingWrongUserPrograms(findUserActiveProgramsMethodName));
    });

    describe('#updateProgram', () => {
        const updatePrograms = (afterProgramUpdated, newProgramData) => {
            const callback = (userId, newPrograms) => {
                return new Promise((resolve, reject) => {
                    expectation.tryCatchForPromise(reject, () => {
                        newProgramData = newProgramData || createTestProgram();
                        newProgramData._id = newPrograms[0]._id;

                        initProgramModelHelper(userId).updatePrograms([newProgramData])
                            .then(() => Program.findById(newProgramData._id).then(updatedProgram =>
                                expectation.tryCatchForPromise(reject, () => {
                                    assert(updatedProgram);
                                    afterProgramUpdated(updatedProgram, newProgramData, resolve, reject); }))
                            ).catch(err => reject(err));
                    });
                });
            };

            return usingTestProgramModels(callback);
        };

        it('should update a program successfully', () => {
            return updatePrograms((updatedProgram, newProgramData, resolve) => {
                assert.strictEqual(updatedProgram.name, newProgramData.name);
                assert.strictEqual(updatedProgram.active, true);
                assert.strictEqual(updatedProgram.audioBetweenStages, true);

                assert(updatedProgram.stages && updatedProgram.stages.length === 1);
                assert.strictEqual(updatedProgram.stages[0].descr, newProgramData.stages[0].descr);

                resolve();
            });
        });

        it('should accept empty program data and update nothing', () => {
            return new Promise((resolve, reject) => {
                initProgramModelHelper().updatePrograms().then(count => {
                    expectation.tryCatchForPromise(reject, () => {
                        assert.strictEqual(count, 0);
                        resolve();
                    });
                }).catch(err => reject(err));
            });
        });
        
        it('shouldn\'t make a program active without stages', () => {
            const newProgramData = createTestProgram();
            newProgramData.stages = [];
            newProgramData.active = true;

            return updatePrograms((updatedProgram, newProgram, resolve, reject) => {

                expectation.tryCatchForPromise(reject, () => {
                    assert(updatedProgram);
                    assert.strictEqual(updatedProgram.active, false);

                    assert(updatedProgram.stages.length === 0);

                    resolve();
                });
            }, newProgramData);
        });

        it('should cause an error when accepting an undefined user id', () =>
            expectation.expectRejection(() => new ProgramModelHelper(mock.mockResponse()).updatePrograms([createTestProgram()])));
    });

    describe('#createPrograms', () => {

        const createPrograms = (newPrograms, onResolve) => {
            return new Promise((resolve, reject) => {
                const userId = generateObjectId();
                initProgramModelHelper(userId).createPrograms(newPrograms).then(createdPrograms => {
                    expectation.tryCatchForPromise(reject, () => {
                        assert(createdPrograms);
                        onResolve(createdPrograms, userId);

                        resolve();
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

        it('should accept an undefined list of programs and create nothing', () => 
            createPrograms(undefined, (createdPrograms) => assert.strictEqual(createdPrograms.length, 0)));

        it('should accept an empty list of programs and create nothing', () => 
            createPrograms([], (createdPrograms) => assert.strictEqual(createdPrograms.length, 0)));

        it('should cause an error when accepting an undefined user id', () =>
            expectation.expectRejection(() => new ProgramModelHelper(mock.mockResponse()).createPrograms([{ name: 'some program' }])));
    });

    describe('#deletePrograms', () => {

        const testProgramRemoval = (getIdsCallback, getExpectedLeftCountCallback) => {
            return usingTestProgramModels((userId, programs) => {
                const progIdsToRemoveArg = getIdsCallback(programs, userId);

                const availableProgIds = programs.map(p => p._id);
                const progIdsToSkip = getExpectedLeftCountCallback ? getExpectedLeftCountCallback(programs, userId):
                    availableProgIds;

                return new Promise((resolve, reject) => {
                    initProgramModelHelper(userId).deletePrograms(progIdsToRemoveArg).then(() =>
                        Program.find({ _id: { $in: availableProgIds } }).then(foundProgs =>
                            expectation.tryCatchForPromise(reject, () => { 
                                assert.strictEqual(foundProgs.length, progIdsToSkip.length);

                                const leftIds = progIdsToSkip.map(id => id.toString());
                                assert(foundProgs.map(p => p._id.toString()).every(id => leftIds.includes(id)));

                                resolve();
                            })));
                });
            });            
        };

        it('should accept an empty list of program ids to delete and do nothing', () => 
            testProgramRemoval(() => undefined));
        
        it('should accept ids of non existent programs and delete nothing', () =>
            testProgramRemoval(() => [generateObjectId(), generateObjectId()]));
        
        it('should delete programs according to passed ids', () =>
            testProgramRemoval(programs => [programs[0]._id.toString(), ...programs.slice(1).map(p => p._id)],
                (programs, userId) => programs.filter(p => p.userId !== userId).map(p => p._id)));

        it('should cause an error when accepting an undefined user id', () =>
            expectation.expectRejection(() => new ProgramModelHelper(mock.mockResponse()).deletePrograms([generateObjectId()])));
    });

    describe('#getShemaRestrictions', () => {
        it('should return correct restrictions to the Program schema model', () => {
            const restrictions = ProgramModelHelper.getShemaRestrictions();

            const lookIntoPath = (restriction, pathObj) => {
                if (pathObj.schema) {
                    for (const option in restriction) {
                        lookIntoPath(restrictions[option], pathObj.schema.path(option));
                    }
                }
                else {
                    for (const option in restriction) {
                        assert.strictEqual(pathObj.options[option], restriction[option]);
                    }
                }
            };

            lookIntoPath(restrictions, Program);
        });
    });

});
