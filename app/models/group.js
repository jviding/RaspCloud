var mongoose = require('mongoose');

var groupSchema = mongoose.Schema({
	name: String,
	users: [String],
	files: [String]
});

//create the model for users and expose it to our app
module.exports = mongoose.model('Group', groupSchema);