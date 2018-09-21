const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let produtSchema = new Schema({
	no: Number,
	time: String,
	username: String,
	content: String,
	location: String,
	comeOn: Number
})
module.exports = mongoose.model('Msgs', produtSchema)
