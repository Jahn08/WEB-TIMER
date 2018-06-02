const config = require('./config');

const passport = require('passport');
const FacebookTokenPassport = require('passport-facebook-token');

const User = require('./models/user');

const facebookTokenStrategy = new FacebookTokenPassport({
    clientID: config.auth.facebook.clientId,
    clientSecret: config.auth.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err)
            return done(err);

        if (user)
            return done(null, user);
        
        let newUser = new User({
            userName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            facebookId: profile.id,
            administrator: User.length == 0
        });

        newUser.save((err, user) => {
            if (err)
                return done(err);

            return done(null, user);
        });
    });
});

passport.use(facebookTokenStrategy);

exports.verifyUser = passport.authenticate('facebook-token', {
    session: false
});