const config = require('./config');

const passport = require('passport');
const FacebookTokenPassport = require('passport-facebook-token');

const dbModelHelper = require('./tools/db-model-helpers');
const UserModelHelper = dbModelHelper.UserModelHelper;

const ResponseError = require('./tools/response-error').ResponseError;

const User = require('./models/user');

const Mailer = require('./tools/mailer');

const loggerContext = config.logger.startLogging('VerifyUser');

const facebookTokenStrategy = new FacebookTokenPassport({
    clientID: config.auth.facebook.clientId,
    clientSecret: config.auth.facebook.clientSecret,
    profileFields: ['email', 'displayName', 'gender', 'location']
}, (accessToken, refreshToken, profile, done) => {
    const userModelHelper = new UserModelHelper();
    userModelHelper.findUserOrEmpty(profile.id).then(user => {
        const proceed = (newUser) => done(null, newUser);

        const savingUser = (userInfo, isNew = false) => {
            loggerContext.info(`Saving the user's data: ${JSON.stringify({ userInfo, isNew })}`);
            
            userInfo.save((err, user) => {
                if (err)
                    done(err);
                else {
                    if (isNew)
                        new Mailer(config).sendAccountCreationMsg(user.email, user.name).then(() => proceed(user));
                    else
                        proceed(user);
                }
            });
        };

        if (user) {
            const facebookEmail = profile.emails[0].value;

            if (user.email !== facebookEmail) {
                loggerContext.info(`Updating the user's mail from ${user.email} to ${facebookEmail}`);

                user.email = facebookEmail;
                savingUser(user);
            }
            else
                proceed(user);
        }
        else {
            loggerContext.info('Creating a new user');

            userModelHelper.countAdministrators().then(count => {
                let newUser = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    facebookId: profile.id,
                    administrator: count === 0,
                    gender: profile.gender
                });

                const location = profile._json.location;
                if (location)
                    newUser.location = location.name;

                savingUser(newUser, true);
            });
        }
    }).catch(err => done(err));
});

passport.use(facebookTokenStrategy);

exports.verifyUser = passport.authenticate('facebook-token', {
    session: false
});

exports.verifyAdmin = (req, res, next) => {
    if (!req.user || !req.user.administrator)
    {
        const respError = new ResponseError(res);
        respError.respondWithAuthenticationError('Unauthorised');
    }
    else
        next();
};