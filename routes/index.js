var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/Users');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome' });
});

router.get('/api/users/login', (req, res) => {
    return res.render('login')
});

router.get('/api/users/register', (req, res) => {
  res.render('register')
});

router.get('/auth/options', (req, res) => {
  if (req.isAuthenticated()){
    return res.render('options')
  }
  else {
    return res.render('403')
  }
});

router.get('/auth/movies', (req, res) => {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.API_KEY}`;
  const img = 'https://image.tmdb.org/t/p/w185';
  if (req.isAuthenticated()) {
    
  fetch(url).then((res) => res.json()).then((movies) => {
      const theMovies = movies.results
      // console.log(theMovies)
      res.render('movies', {theMovies, img})
  })
  .catch((err) => console.log(err))
  }
  else {
    return res.render('403')
  }
});

router.get('/auth/random',(req, res) => {
  const url = 'https://randomuser.me/api/?results=20';
  if (req.isAuthenticated()) {
    fetch(url).then((res) => res.json()).then((random) => {
      const people = random.results
      res.render('random', {people})
  })
  .catch((err) => console.log(err))
  } else {
    return res.render('403')
  }
  
});


  // res.render('options')
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/auth/options',
    failureRedirect: '/api/users/register',
    failureFlash: true
  })
  );

router.post('/api/users/register', 
  [check('name', 'Name is required').not().isEmpty(), 
  check('email', 'Please include a valid email').isEmail(), 
  check('password', 'Please include valid password').isLength({min: 3})], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors);
        return res.render('register', { errors: 'All inputs must be filled'});
    };
    
    User.findOne({ email:req.body.email})
    .then((user) => {
        if(user) {
            return console.log('User Exists')
        } else  {
            const user = new User();
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            user.name = req.body.name;
            user.email = req.body.email;
            user.password = hash;

            user.save().then(user => {
                // return res.status(200).json({ message: 'User Created', user });
                return req.login(user, err => {
                    if (err) {
                        return res.status(500).json({message: 'Server error'});
                    } else {
                        res.redirect('/auth/options');
                        // next();
                    }
                })
            })
            .catch(err => console.log(err));
        }; 
    });
});

router.get('/logout', (req, res) => {
  if (req.user === undefined) {
      req.flash('successMessage', 'No on to log out');
      return res.redirect('/');
  }
  req.logout();
  req.flash('successMessage', 'You are now logged out');
  return res.redirect('/')
});

module.exports = router;
