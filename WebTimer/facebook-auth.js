const config = require('./config');

const passport = require('passport');
const FacebookTokenPassport = require('passport-facebook-token');

const dbModelHelper = require('./tools/db-model-helpers');
const UserModelHelper = dbModelHelper.UserModelHelper;

const User = require('./models/user');

const facebookTokenStrategy = new FacebookTokenPassport({
    clientID: config.auth.facebook.clientId,
    clientSecret: config.auth.facebook.clientSecret,
    profileFields: ['email', 'first_name', 'last_name', 'gender', 'location']
}, (accessToken, refreshToken, profile, done) => {
    const userModelHelper = new UserModelHelper();
    userModelHelper.findUserOrEmpty(profile.id).then(user => {
        if (user)
            done(null, user);
        else {
            let newUser = new User({
                name: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                facebookId: profile.id,
                administrator: User.length == 0,
                gender: profile.gender
            });

            const location = profile._json.location;
            if (location)
                newUser.location = location.name;

            newUser.save((err, user) => {
                if (err)
                    done(err);
                else
                    done(null, user);
            });
        }
    }).catch(err => done(err));
});

passport.use(facebookTokenStrategy);

exports.verifyUser = passport.authenticate('facebook-token', {
    session: false
});