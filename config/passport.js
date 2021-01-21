const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField:'lozinka'}, (email, lozinka, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Ne postoji korisnik sa tim emailom!' });
        }

        // Match lozinka
        bcrypt.compare(lozinka, user.lozinka, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user,{message: `Dobrodošli ${user.ime}!`});
          } else {
            return done(null, false, { message: 'Neispravna lozinka!' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
