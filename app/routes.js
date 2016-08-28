var fs = require('fs');
var Group = require('../app/models/group');
var User = require('../app/models/user');

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
	app.get('/group/:grpId', isLoggedAdmin, function (req, res) {
		var message = req.session.message;
		req.session.message = null;
		viewManageGroup(req.params.grpId, function (group) {
			getAllUsers(function (users) {
				res.render('managegroup.ejs', {
					message: message,
					group: group,
					users: users
				});
			});
		});
	});

	// Add a user to a group
	app.get('/group/:grpId/add/:usrId', isLoggedAdmin, function (req, res) {
		Group.findOne({'_id':req.params.grpId}, function (err, group) {
			if (err) { throw err; }
			else {
				if (group.users.indexOf(req.params.usrId) === -1) {
					group.users.push(req.params.usrId);
					group.save(function (err) {
						if (err) { throw err; }
						else {
							res.redirect('/group/'+req.params.grpId);
						}
					});
				} else {
					res.redirect('/group/'+req.params.grpId);
				}
			}
		});
	});

	// Remove user from a group
	app.get('/group/:grpId/remove/:usrId', isLoggedAdmin, function (req, res) {
		Group.findOne({'_id':req.params.grpId}, function (err, group) {
			if (err) { throw err; }
			else {
				if (group.users.indexOf(req.params.usrId) !== -1 ) {
					group.users.splice(group.users.indexOf(req.params.usrId), 1);
					group.save(function (err) {
						if (err) { throw err; }
						else {
							res.redirect('/group/'+req.params.grpId);
						}
					});
				} else {
					res.redirect('/group/'+req.params.grpId);
				}
			}
		});
	});

	// View a group
	app.get('/profile/group/:grpId', isAuthorized, function (req, res) {
		var message = req.session.message;
		req.session.message = null;
		Group.findOne({'_id':req.params.grpId}, function (err, group) {
			fs.readdir('/media/usb/website/'+group.name+'/', function (err, files) {
				console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' - viewing '+group.name);
				res.render('group.ejs', {
					message: message,
					group: group,
					files: files
				});
			});
		});
	});

	// Download a file
	app.get('/profile/group/:grpId/download/:fileName', isAuthorized, function (req, res) {
		Group.findOne({'_id':req.params.grpId}, function (err, group) {
			var path = '/media/usb/website/'+group.name+'/'+req.params.fileName;
			console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' - downloading '+'/media/usb/website/'+group.name+'/'+req.params.fileName);
			res.download(path);
		});
	});

	// Upload a file
	app.post('/profile/group/:grpId/upload', isAuthorized, function (req, res) {
		Group.findOne({'_id':req.params.grpId}, function (err, group) {
			fs.readdir('/media/usb/website/'+group.name+'/', function (err, files) {
				if (!req.files) {
					console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' - upload failed! No file selected.');
					req.session.message = 'File upload failed!';
					res.redirect('/profile/group/'+req.params.grpId);
				} else {
					var filename = req.files.fileUpload.name;
					filename = filename.replace(/ /g,'');
					if (files.indexOf(filename) !== -1) {
						console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' failed to upload '+filename+' to group '+group.name+'. Filename already exists.');
						req.session.message = 'File upload failed! File with the same name already exists!';
						res.redirect('/profile/group/'+req.params.grpId);
					} else {
						console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' is uploading '+filename+' to group '+group.name+'.');
						file = req.files.fileUpload;
						file.mv('/media/usb/website/'+group.name+'/'+filename, function (err) {
							if (err) { 
								console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' - upload failed!');
								req.session.message = 'File upload failed! Something went wrong.';
								res.redirect('/profile/group/'+req.params.grpId);
							}
							else { 
								console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' - upload successfully completed!');
								req.session.message = 'File successfully uploaded!';
								res.redirect('/profile/group/'+req.params.grpId);
							}
						});
					}
				}
			});
		});
	});

	// Logout
	app.get('/logout', function (req, res) {
		console.log(req.user.facebook.givenName+' '+req.user.facebook.familyName+' has logged out.');
		req.logout();
		res.redirect('/');
	});

};

function isAuthorized(req, res, next) {
	Group.findOne({'_id':req.params.grpId}, function (err, group) {
		if (req.isAuthenticated() && group.users.indexOf(req.user.id) !== -1) {
			return next();
		}
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
	fs.mkdirSync('/media/usb/website/'+req.body.name);
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
		if (err) { throw err; }
		else { callback(all); }
	});
};

// View ManageGroup
function viewManageGroup(id, callback) {
	Group.findOne({'_id':id}, function (err, group) {
		if (err) { throw err; }
		else { callback(group); }
	});
};

// Get all users
function getAllUsers(callback) {
	User.find({}, function (err, users) {
		if (err) { throw err; }
		else { callback(users); }
	});
};