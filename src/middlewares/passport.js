'use strict';

const passport          = require('passport');
const GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
        consumerKey: GOOGLE_CONSUMER_KEY,
        consumerSecret: GOOGLE_CONSUMER_SECRET,
        callbackURL: "/api/google/redirect"
    },
    function(token, tokenSecret, profile, done) {
        return done(null, {
            profile: profile,
            token: token
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});