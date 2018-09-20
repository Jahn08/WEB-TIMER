const ResponseError = require('./response-error').ResponseError;

exports.UserModelHelper = function (response = null) {
    const UserModel = require('../models/user');
    const ITEMS_PER_PAGE = require('../models/constants').ITEMS_PER_PAGE;

    let respErr;

    if (response)
        respErr = new ResponseError(response);

    const getMaxLengthForSchemaPath = (path) => {
        const schema = UserModel.schema;
        return { maxlength: schema.path(path).options.maxlength };
    }

    this.getShemaRestrictions = function () {
        return {
            name: getMaxLengthForSchemaPath('name'),
            email: getMaxLengthForSchemaPath('email')
        };
    };

    const processError = (err, reject, respErrMethodName = 'respondWithDatabaseError') => {
        if (respErr)
            respErr[respErrMethodName](err);

        reject(err);
    };

    const searchForUser = (searchMethodName, key) => {
        return new Promise((resolve, reject) => {
            UserModel[searchMethodName](key, (err, user) => {
                if (err)
                    processError(err, reject);
                else
                    resolve(user);
            });
        });
    };

    this.findUserByIdOrEmpty = (id) => searchForUser('findById', id);

    this.findUserOrEmpty = (facebookId) => searchForUser('findOne', { facebookId });

    const buildRegexQuery = (fieldName, pattern) => {
        let query = { };
        query[fieldName] = { $regex: pattern, $options: 'i' };

        return query;
    };

    const buildQueryForPage = (searchFor) => {
        let query;

        if (searchFor) {
            query = UserModel.find({
                $or: [buildRegexQuery('name', searchFor),
                    buildRegexQuery('gender', searchFor),
                    buildRegexQuery('location', searchFor)]
            });
        }
        else
            query = UserModel.find();

        return query;
    };

    this.getUsersForPage = function (pageNum, searchFor, sortOption) {
        return new Promise((resolve, reject) => {
            buildQueryForPage(searchFor).count((err, count) => {
                if (err)
                    processError(err, reject);
                else {
                    const query = buildQueryForPage(searchFor);

                    if (sortOption && Object.keys(sortOption).filter(k => k).length > 0)
                        query.sort(sortOption);

                    pageNum = pageNum || 1;

                    query.skip(ITEMS_PER_PAGE * (pageNum - 1)).limit(ITEMS_PER_PAGE).exec((err, users) => {
                        if (err)
                            processError(err, reject);
                        else
                            resolve({ users, count });
                    });
                }
            });

        });
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

    this.getShemaRestrictions = function () {
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

    this.getNumberOfUserActivePrograms = function (userId) {
        return new Promise((resolve, reject) => {
            ProgramModel.count({ userId, active: true }, (err, count) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else
                    resolve(count);
            });
        });
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
            if (!dbPrograms || !dbPrograms.length || !reductionList) {
                resolve(dbPrograms);
                return;
            }

            const reductionIds = reductionList.filter(p => p._id).map(p => p._id);
            
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