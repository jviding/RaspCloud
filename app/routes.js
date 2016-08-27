var Group = require('../app/models/group');

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
		getGroups(req, function (groups) {
			res.render('profile.ejs', {
				user : req.user,
				groups: groups
			});
		});
	});

	// Manage Accounts
	app.get('/manageaccounts', isLoggedAdmin, function (req, res) {
		res.render('admin.ejs');
	});

	// Manage Groups
	app.get('/managegroups', isLoggedAdmin, function (req, res) {
		var message = req.session.message;
		req.session.message = null;
		getGroups(req, function (groups) {
			res.render('managegroups.ejs', {
				message: message,
				groups: groups
			});
		});
	});

	// Create a new Group
	app.post('/creategroup', isLoggedAdmin, function (req, res) {
		createNewGroup(req, function (message) {
			req.session.message = message;
			res.redirect('/managegroups');
		});
	});

	// Manage a single Group
	app.get('/group/:grpId', function (req, res) {
		var message = req.session.message;
		req.session.message = null;
		viewManageGroup(req.params.grpId, function (group) {
			res.render('managegroup.ejs', {
				message: message,
				group: group
			});
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

// Create a new group
function createNewGroup(req, callback) {
	Group.findOne({'name' : req.body.name }, function (err, group) {
		if (err) { callback('Something went wrong!'); return; }
		if (group) { callback('Name already taken!'); return; }
		else {
			var newGroup = new Group();
			newGroup.name = req.body.name;
			newGroup.save(function (err) {
				if (err) { throw err; }
				callback('Successfully created!');
				return;
			});
		}
	});
};

// Create a list of all groups
function getGroups(req, callback) {
	Group.find({}, function (err, all) {
		if (err) { callback([]); }
		callback(all);
	});
};

// View ManageGroup
function viewManageGroup(id, callback) {
	Group.findOne({'_id':id}, function (err, group) {
		if (err) { callback(null); }
		console.log('found' + group);
		callback(group);
	});
};