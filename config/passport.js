var FacebookStrategy = require('passport-facebook').Strategy;
//load up the user model
var User = require('../app/models/user');
//load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

	//for serializing the user for the session
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	//for deserializing the user
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	//FACEBOOK
	passport.use(new FacebookStrategy({
		clientID : configAuth.facebookAuth.clientID,
		clientSecret : configAuth.facebookAuth.clientSecret,
		callbackURL : configAuth.facebookAuth.callbackURL,
		passReqToCallback : true
	},
	function(req, token, refreshToken, profile, done) {
		process.nextTick(function () {
			if (!req.user) {
				User.findOne({'facebook.id' : profile.id}, function (err, user) {
					if (err) {
						return done(err);
					}
					if (user) {
						console.log(profile.displayName + ' has logged in!');
						return done(null, user);
					}
					else {
						var newUser = new User();
						newUser.facebook.id = profile.id;
						newUser.facebook.token = token;
						//returns often undefined - take from another source
						newUser.facebook.givenName = profile.displayName.split(' ')[0];//profile.name.givenName;
						newUser.facebook.familyName = profile.displayName.split(' ')[1];//profile.name.familyName;
						newUser.facebook.email = profile.displayName;//profile.emails[0].value;

						newUser.authorized = false;
						newUser.admin = false;

						newUser.save(function (err) {
							if (err) {
								console.log(profile.displayName + ' failed to register!');
								throw err;
							}
							console.log(profile.displayName + ' has registered!');
							return done(null, newUser);
						});
					}
				});
			}
		});
	}));
};