const ResponseError = require('./response-error').ResponseError;

exports.UserModelHelper = function (UserModel) {
    let respErr;

    this.setReponse = function (response) {
        respErr = new ResponseError(response);
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

exports.ProgramModelHelper = function (ProgramModel, response) {
    const respErr = new ResponseError(response);

    this.findUserPrograms = function (userId) {
        return new Promise((resolve, reject) => {
            ProgramModel.find({ userId }, (err, programs) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else
                    resolve(programs);
            });
        });
    };

    this.updateProgram = function (programForUpdate, newProgramData) {
        return new Promise((resolve, reject) => {
            programForUpdate.name = newProgramData.name;
            programForUpdate.stages = newProgramData.stages;
            programForUpdate.active = newProgramData.active;

            programForUpdate.save((err, resp) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else
                    resolve()
            });
        });
    };

    this.createPrograms = function (programs, userId) {
        return new Promise((resolve, reject) => {
            if (!programs || !programs.length) {
                resolve();
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
                    resolve();
            });
        });
    };

    this.reduceProgramsToList = function (dbPrograms, reductionList) {
        return new Promise((resolve, reject) => {
            if (!dbPrograms || !reductionList) {
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