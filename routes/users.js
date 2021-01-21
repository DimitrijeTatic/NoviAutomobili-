const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { ime, email, lozinka, lozinka2 } = req.body;
  let errors = [];

  if (!ime || !email || !lozinka || !lozinka2) {
    errors.push({ msg: 'Molimo popunite sva polja!' });
  }

  if (lozinka != lozinka2) {
    errors.push({ msg: 'Lozinke se ne podudaraju!' });
  }

  if (lozinka.length < 6) {
    errors.push({ msg: 'Lozinka mora biti minimum 6 karaktera' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      ime,
      email,
      lozinka,
      lozinka2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email je već iskorišćen!' });
        res.render('register', {
          errors,
          ime,
          email,
          lozinka,
          lozinka2
        });
      } else {
        const newUser = new User({
          ime,
          email,
          lozinka
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.lozinka, salt, (err, hash) => {
            if (err) throw err;
            newUser.lozinka = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Uspešna registracija! Ulogujte se'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
    successFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Uspešno ste izlogovani!');
  res.redirect('/users/login');
});

module.exports = router;
