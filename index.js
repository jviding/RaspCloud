var express = require('express');
var app = express();
var port = 3000;
var http = require('http').Server(app);
var passport = require('passport');
var session = require('express-session')
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var configDB = require('./config/database');

// Configuration
require('./config/passport')(passport);
mongoose.connect(configDB.url); //connect to database 

// Set up express application
app.use(cookieParser());//read cookies

// Set Public Folder
app.set('view engine', 'ejs'); //set up ejs for templating
app.use(express.static(__dirname + '/public'));

// Passport
app.use(session({secret:'this_to_be_changed_for_production'}));
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions

// Routes
require('./app/routes')(app, passport);

// Run Server
http.listen(port, function(){
  console.log('Server listening on port: '+port);
});