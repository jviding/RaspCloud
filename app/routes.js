module.exports = function (app, passport) {
	
	// Home Page
	app.get('/', notLoggedIn, function (req, res) {
		res.render('index.ejs');
	});

	// Facebook Login
	app.get('/auth/facebook', passport.authenticate('facebook', {scope : 'email'}));
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// Profile
	app.get('/profile', isLoggedIn, function (req, res) {
		res.render('profile.ejs', {
			user : req.user,
			groups: ['a', 'b', 'c']
		});
	});

	// Admin
	app.get('/admin', isLoggedAdmin, function (req, res) {
		res.render('admin.ejs');
	});

	// Manage Groups
	app.get('/managegroups', isLoggedAdmin, function (req, res) {
		res.render('managegroups.ejs', {
			groups: ['a', 'b', 'c']
		});
	});

	// Logout
	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	//if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
		return next();
	}
	//if they aren't, redirect them to the home page
	res.redirect('/');
};

//route middleware to make sure a user is logged in as admin
function isLoggedAdmin(req, res, next) {
	//if user is admin, carry on
	if (req.isAuthenticated() && req.user.admin) {
		return next();
	}
	//if they aren't, redirect them to the home page
	res.redirect('/');
};

//route middleware to make sure a user is not logged in
function notLoggedIn(req, res, next) {
	//if user is not authenticated in the session, carry on
	if (!req.isAuthenticated()) {
		return next();
	}
	//if they are, redirect them to the home page
	res.redirect('/profile');
};