const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
passport.serializeUser((user, done) => {
done(null, user._id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
    done(err, user);
    });
});
passport.use(
    'local-login',
    new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    (req, email, password, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
        console.log('1.', req);
        console.log('2.', email);
        console.log('3.', password);
        console.log('4.', done);
        if (err) {
            return done(err, null);
        }
        if (!user) {
            return done(null, false, req.flash('errorsMessage', 'User Not Found'));
        }
        bcrypt
            .compare(password, user.password)
            .then(result => {
            if (!result) {
                return done(
                null,
                false,
                req.flash('errorsMessage', 'Check email or password')
                );
            } else {
                return done(null, user);
            }
            })
            .catch(error => {
            throw error;
            });
        });
    }
)
);
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated) {
    return next();
    }
    return res.redirect('/login');
};