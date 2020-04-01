const express = require('express'),
	router = express.Router({ mergeParams: true }),
	mongoose = require('mongoose'),
	passport = require('passport'),
	middleware = require('../middleware/index');

// ------------------------------------------ //
// 			MODELS CONFIG
// ------------------------------------------ //
const User = require('../models/user');

router.get('/', (req, res) => {
	res.render('index', { currentUser: req.user });
});

//
// 	REGISTER
//

// SHOW - Login form
router.get('/register', (req, res) => {
	res.render('register');
});

// SHOW - Login form
router.post('/register', (req, res) => {
	let newUser = new User({ username: req.body.username });

	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('register');
		} else {
			passport.authenticate('local')(req, res, () => {
				req.flash('success', 'Registered as ' + user.username);
				res.redirect('/');
			});
		}
	});
});

//
// 	LOGIN
//

// SHOW - Login form
router.get('/login', (req, res) => {
	res.render('login');
});
// Handle login logic
router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }), (req, res) => {
	res.send('Login Success');
});

// logout route
router.get('/logout', (req, res) => {
	req.logOut();
	req.flash('success', 'Logged out.');
	res.redirect('/');
});

module.exports = router;

