﻿const ResponseError = require('./response-error').ResponseError;

exports.UserModelHelper = function () {
    const UserModel = require('../models/user');

    let respErr;

    this.setReponse = function (response) {
        respErr = new ResponseError(response);
    };

    const getMaxLengthForSchemaPath = (path) => {
        const schema = UserModel.schema;
        return { maxlength: schema.path(path).options.maxlength };
    }

    this.getShemaRestrictions = () => {
        return {
            name: getMaxLengthForSchemaPath('name'),
            email: getMaxLengthForSchemaPath('email')
        };
    };
    
    const internalUserSearch = function (facebookId, rejectIfEmpty) {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ facebookId }, (err, user) => {
                if (err) {
                    if (respErr)
                        respErr.respondWithDatabaseError(err);

                    reject(err);
                }
                else if (rejectIfEmpty && !user) {
                    if (respErr)
                        respErr.respondWithUserIsNotFoundError();

                    reject('User is not found');
                }
                else
                    resolve(user);
            });
        });
    };

    this.findUser = function (facebookId) {
        return internalUserSearch(facebookId, true);
    };

    this.findUserOrEmpty = function (facebookId) {
        return internalUserSearch(facebookId);
    };
};

exports.ProgramModelHelper = function (response) {
    const ProgramModel = require('../models/program');
    
    const respErr = new ResponseError(response);

    const getOptionForSchemaPath = (paths, optionNames = ['maxlength']) => {
        let pathObj;

        let schema = ProgramModel.schema;

        do {
            let path = paths.shift();
            pathObj = schema.path(path);

            schema = pathObj.schema;
        } while (paths.length);
        
        let options = {};
        optionNames.forEach(op => options[op] = pathObj.options[op])

        return options;
    }

    ProgramModel.schema.path('stages').schema.path('descr').options

    this.getShemaRestrictions = () => {
        return {
            name: getOptionForSchemaPath(['name']),
            stages: {
                descr: getOptionForSchemaPath(['stages', 'descr']),
                duration: getOptionForSchemaPath(['stages', 'duration'], ['max', 'min'])
            } 
        };
    };

    const searchForPrograms = (userId, active) => {
        return new Promise((resolve, reject) => {
            let filter = { userId };

            if (active != null)
                filter.active = active;

            ProgramModel.find(filter, (err, programs) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else
                    resolve(programs.sort((a, b) => a.name > b.name));
            });
        });
    };

    this.findUserPrograms = function (userId) {
        return searchForPrograms(userId);
    };

    this.findUserActivePrograms = function (userId) {
        return searchForPrograms(userId, true);
    };

    this.updateProgram = function (programForUpdate, newProgramData) {
        return new Promise((resolve, reject) => {
            newProgramData = newProgramData || {};

            if (newProgramData.name)
                programForUpdate.name = newProgramData.name;

            programForUpdate.stages = newProgramData.stages || [];
            programForUpdate.active = newProgramData.active || false;

            programForUpdate.save((err, resp) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else
                    resolve(resp);
            });
        });
    };
    
    this.createPrograms = function (programs, userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                const errMsg = 'A required parameter userId is undefined';
                respErr.respondWithUnexpectedError(errMsg);
                reject(errMsg);
                return;
            }

            if (!programs || !programs.length) {
                resolve([]);
                return;
            }

            programs.forEach(p => {
                p._id = undefined;
                p.userId = userId;
            });

            ProgramModel.create(programs, (err, resp) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else
                    resolve(programs);
            });
        });
    };

    this.reduceProgramsToList = function (dbPrograms, reductionList) {
        return new Promise((resolve, reject) => {
            if (!dbPrograms || !dbPrograms.length || !reductionList || !reductionList.length) {
                resolve(dbPrograms);
                return;
            }

            const reductionIds = reductionList.filter(p => p._id).map(p => p._id);
            if (reductionIds.length == 0) {
                resolve(dbPrograms);
                return;
            }

            let reducedProgramList = [];
            let idsForRemoval = [];
            dbPrograms.forEach(serverProgram => {
                if (reductionIds.every(id => id !== serverProgram._id.toString()))
                    idsForRemoval.push(serverProgram._id);
                else
                    reducedProgramList.push(serverProgram);
            });

            ProgramModel.remove({ _id: { $in: idsForRemoval } }, err => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else
                    resolve(reducedProgramList);
            });
        });
    };

};