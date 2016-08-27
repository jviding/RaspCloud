var express = require('express');
var app = express();
var port = 3000;
var http = require('http').Server(app);
var morgan = require('morgan');
var passport = require('passport');
var session = require('express-session')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var configDB = require('./config/database');

// Configuration
require('./config/passport')(passport);
//mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); //connect to database 

// Set up express application
app.use(morgan('dev')); //log every request to console
app.use(cookieParser());//read cookies
//app.use(bodyParser());  //get information from html forms // DEPRECATED
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set Public Folder
app.set('view engine', 'ejs'); //set up ejs for templating
app.use(express.static(__dirname + '/public'));

// Passport
app.use(session({
	secret:'this_to_be_changed_for_production',
	saveUninitialized: true,
	resave: true	
}));
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions

// Routes
require('./app/routes')(app, passport);

// Run Server
http.listen(port, function(){
  console.log('Server listening on port: '+port);
});