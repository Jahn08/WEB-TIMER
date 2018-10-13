const ResponseError = require('./response-error').ResponseError;
const config = require('../config');

const logOutcome = (loggerContext, data) => loggerContext.info(`outcome: ${JSON.stringify(data)}`);

const logInitialData = (loggerContext, data) => loggerContext.info(JSON.stringify(data));

exports.UserModelHelper = function (response = null) {
    const UserModel = require('../models/user');
    const ITEMS_PER_PAGE = require('../models/constants').ITEMS_PER_PAGE;

    const loggerContext = config.logger.startLogging('UserModelHelper');

    let respErr;

    if (response)
        respErr = new ResponseError(response);

    const getMaxLengthForSchemaPath = (path) => {
        const schema = UserModel.schema;
        return { maxlength: schema.path(path).options.maxlength };
    }

    this.getShemaRestrictions = function () {
        loggerContext.info();

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
        logInitialData(loggerContext, { searchMethodName, key });
        
        return new Promise((resolve, reject) => {
            UserModel[searchMethodName](key, (err, user) => {
                if (err)
                    processError(err, reject);
                else {
                    logOutcome(loggerContext, { user });
                    resolve(user);
                }
            });
        });
    };
    
    this.countAdministrators = () => searchForUser('count', { administrator: true });

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
        logInitialData(loggerContext, { pageNum, searchFor, sortOption });
        
        return new Promise((resolve, reject) => {
            buildQueryForPage(searchFor).count((err, count) => {
                if (err)
                    processError(err, reject);
                else {
                    const query = buildQueryForPage(searchFor);

                    if (sortOption && Object.keys(sortOption).filter(k => k).length > 0)
                        query.sort(sortOption);

                    pageNum = pageNum || 1;
                    const pagesToSkip = ITEMS_PER_PAGE * (pageNum - 1);
                    loggerContext.info(`skip ${pagesToSkip} pages and take ${ITEMS_PER_PAGE} items`);

                    query.skip(pagesToSkip).limit(ITEMS_PER_PAGE).exec((err, users) => {
                        if (err)
                            processError(err, reject);
                        else {
                            const outcome = { users, count };

                            logOutcome(loggerContext, outcome);
                            resolve(outcome);
                        }
                    });
                }
            });

        });
    };
};

exports.ProgramModelHelper = function (response) {
    const ProgramModel = require('../models/program');
    
    const respErr = new ResponseError(response);

    const loggerContext = config.logger.startLogging('UserModelHelper');
    
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
        loggerContext.info();
        
        return {
            name: getOptionForSchemaPath(['name']),
            stages: {
                descr: getOptionForSchemaPath(['stages', 'descr']),
                duration: getOptionForSchemaPath(['stages', 'duration'], ['max', 'min'])
            } 
        };
    };
    
    const searchForPrograms = (userId, active) => {
        logInitialData(loggerContext, { userId, active });
        
        return new Promise((resolve, reject) => {
            let filter = { userId };

            if (active != null)
                filter.active = active;

            ProgramModel.find(filter, (err, programs) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else {
                    const outcome = programs.sort((a, b) => a.name > b.name);

                    logOutcome(loggerContext, { outcome });
                    resolve(outcome);
                }
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
        logInitialData(loggerContext, { userId });

        return new Promise((resolve, reject) => {
            ProgramModel.count({ userId, active: true }, (err, count) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else {
                    logOutcome(loggerContext, { count });
                    resolve(count);
                }
            });
        });
    };

    this.updateProgram = function (programForUpdate, newProgramData) {
        logInitialData(loggerContext, { programForUpdate, newProgramData });

        return new Promise((resolve, reject) => {
            newProgramData = newProgramData || {};

            if (newProgramData.name)
                programForUpdate.name = newProgramData.name;

            const newStages = newProgramData.stages || [];
            programForUpdate.stages = newStages;
            programForUpdate.active = newStages.length === 0 ? false :
                (newProgramData.active || false);

            programForUpdate.save((err, resp) => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else {
                    logOutcome(loggerContext, { resp });
                    resolve(resp);
                }
            });
        });
    };
    
    this.createPrograms = function (programs, userId) {
        logInitialData(loggerContext, { programs, userId });

        return new Promise((resolve, reject) => {
            if (!userId) {
                const errMsg = 'A required parameter userId is undefined';
                respErr.respondWithUnexpectedError(errMsg);
                reject(errMsg);
                return;
            }

            if (!programs || !programs.length) {
                loggerContext.warn('the list of programs to create is empty');
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
                else {
                    logOutcome(loggerContext, { programs, resp });
                    resolve(programs);
                }
            });
        });
    };

    this.reduceProgramsToList = function (dbPrograms, reductionList) {
        logInitialData(loggerContext, { dbPrograms, reductionList });

        return new Promise((resolve, reject) => {
            if (!dbPrograms || !dbPrograms.length || !reductionList) {
                loggerContext.warn('nothing will be reduced since the passed data is empty');
                resolve(dbPrograms);

                return;
            }

            const reductionIds = reductionList.filter(p => p._id).map(p => p._id.toString());
            loggerContext.info(`ids for programs to save: ${JSON.stringify(reductionIds)}`);

            let reducedProgramList = [];
            let idsForRemoval = [];
            dbPrograms.forEach(serverProgram => {
                const programIdStr = serverProgram._id.toString();

                if (reductionIds.every(id => id !== programIdStr))
                    idsForRemoval.push(serverProgram._id);
                else
                    reducedProgramList.push(serverProgram);
            });

            loggerContext.info(`ids for programs to remove: ${JSON.stringify(idsForRemoval)}`);

            ProgramModel.remove({ _id: { $in: idsForRemoval } }, err => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else {
                    logOutcome(loggerContext, { reducedProgramList });
                    resolve(reducedProgramList);
                }
            });
        });
    };

};