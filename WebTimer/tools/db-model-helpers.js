const ResponseError = require('./response-error').ResponseError;
const config = require('../config');

const UserModel = require('../models/user');
const ProgramModel = require('../models/program');

const ITEMS_PER_PAGE = require('../models/constants').ITEMS_PER_PAGE;

const logOutcome = (loggerContext, data) => loggerContext.info(`outcome: ${JSON.stringify(data)}`);
const logInitialData = (loggerContext, data) => loggerContext.info(JSON.stringify(data));

function UserModelHelper(response = null) {
    const loggerContext = config.logger.startLogging('UserModelHelper');

    let respErr;

    if (response)
        respErr = new ResponseError(response);

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
        const query = {};
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
}

UserModelHelper.getShemaRestrictions = function () {
    const getMaxLengthForSchemaPath = (path) => {
        const schema = UserModel.schema;
        return { maxlength: schema.path(path).options.maxlength };
    };
    
    return {
        name: getMaxLengthForSchemaPath('name'),
        email: getMaxLengthForSchemaPath('email')
    };
};

exports.UserModelHelper = UserModelHelper;

function ProgramModelHelper(response, userId) {
    const loggerContext = config.logger.startLogging('ProgramModelHelper');
    logInitialData(loggerContext, { userId });
    
    const respErr = new ResponseError(response);
    
    const searchForPrograms = (active) => {
        logInitialData(loggerContext, { active });
        
        return new Promise((resolve, reject) => {
            if (!checkUserId(reject))
                return;
            
            const filter = { userId };

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

    this.findUserPrograms = function () {
        return searchForPrograms();
    };

    this.findUserActivePrograms = function () {
        return searchForPrograms(true);
    };

    this.getNumberOfUserActivePrograms = function () {
        loggerContext.info();

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

    const checkUserId = (reject) => {
        if (!userId) {
            const errMsg = 'A required parameter userId is undefined';
            respErr.respondWithUnexpectedError(errMsg);
            reject(errMsg);

            return false;
        }

        return true;
    };

    this.updatePrograms = function (programs = []) {
        logInitialData(loggerContext, { programs });

        return new Promise((resolve, reject) => {
            if (!checkUserId(reject))
                return;

            if (!programs.length) {
                loggerContext.warn('the list of programs to update is empty');
                resolve(0);

                return;
            }

            const programIds = programs.map(p => p._id);

            ProgramModel.find({ _id: { $in: programIds }, userId }, (err, progsForUpdate) => {
                logOutcome(loggerContext, { progsForUpdate });

                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);

                    return;
                }
                
                Promise.all(progsForUpdate.map(dbProg => {
                    const newProg = programs.find(p => p._id.toString() === dbProg._id.toString());

                    if (newProg.name)
                        dbProg.name = newProg.name;

                    const newStages = newProg.stages || [];
                    dbProg.stages = newStages;
                    dbProg.active = newStages.length === 0 ? false : (newProg.active || false);
                    dbProg.audioBetweenStages = newProg.audioBetweenStages || false;

                    return new Promise((resolve1, reject1) => {
                        dbProg.save((err, resp) => {
                            if (err) {
                                respErr.respondWithDatabaseError(err);
                                reject1(err);
                            }
                            else {
                                logOutcome(loggerContext, { resp });
                                resolve1(resp);
                            }
                        });
                    });
                })).then(() => resolve(progsForUpdate.length)).catch(err => reject(err));
            });
        });
    };
    
    this.createPrograms = function (programs = []) {
        logInitialData(loggerContext, { programs });

        return new Promise((resolve, reject) => {
            if (!checkUserId(reject))
                return;
            
            if (!programs.length) {
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

    this.deletePrograms = function (programIds = []) {
        logInitialData(loggerContext, { programIds });

        return new Promise((resolve, reject) => {
            if (!checkUserId(reject))
                return;

            if (!programIds.length) {
                loggerContext.warn('the list of program ids to delete is empty');
                resolve();

                return;
            }

            ProgramModel.deleteMany({ _id: { $in: programIds }, userId }, err => {
                if (err) {
                    respErr.respondWithDatabaseError(err);
                    reject(err);
                }
                else {
                    logOutcome(loggerContext, {});
                    resolve();
                }
            });
        });
    };
}

ProgramModelHelper.getShemaRestrictions = function () {
    const getOptionForSchemaPath = (paths, optionNames = ['maxlength']) => {
        let pathObj;

        let schema = ProgramModel.schema;

        do {
            let path = paths.shift();
            pathObj = schema.path(path);

            schema = pathObj.schema;
        } while (paths.length);
        
        const options = {};
        optionNames.forEach(op => options[op] = pathObj.options[op]);

        return options;
    };
    
    return {
        name: getOptionForSchemaPath(['name']),
        stages: {
            descr: getOptionForSchemaPath(['stages', 'descr']),
            duration: getOptionForSchemaPath(['stages', 'duration'], ['max', 'min'])
        } 
    };
};

exports.ProgramModelHelper = ProgramModelHelper;
