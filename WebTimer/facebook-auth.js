const config = require('./config');

const passport = require('passport');
const FacebookTokenPassport = require('passport-facebook-token');

const dbModelHelper = require('./tools/db-model-helpers');
const UserModelHelper = dbModelHelper.UserModelHelper;

const ResponseError = require('./tools/response-error').ResponseError;

const User = require('./models/user');

const Mailer = require('./tools/mailer');

const facebookTokenStrategy = new FacebookTokenPassport({
    clientID: config.auth.facebook.clientId,
    clientSecret: config.auth.facebook.clientSecret,
    profileFields: ['email', 'displayName', 'gender', 'location']
}, (accessToken, refreshToken, profile, done) => {
    const userModelHelper = new UserModelHelper();
    userModelHelper.findUserOrEmpty(profile.id).then(user => {
        const proceed = (newUser) => done(null, newUser);

        const savingUser = (userInfo, isNew = false) => {
            userInfo.save((err, user) => {
                if (err)
                    done(err);
                else {
                    if (isNew)
                        new Mailer(config).sendAccountCreationMsg(user.email, user.name).then(info => proceed(user));
                    else
                        proceed(user);
                }
            });
        };

        if (user) {
            const facebookEmail = profile.emails[0].value;

            if (user.email !== facebookEmail) {
                user.email = facebookEmail;
                savingUser(user);
            }
            else
                proceed(user);
        }
        else {
            let newUser = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                facebookId: profile.id,
                administrator: User.length == 0,
                gender: profile.gender
            });

            const location = profile._json.location;
            if (location)
                newUser.location = location.name;

            savingUser(newUser, true);
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