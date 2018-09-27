const express = require('express');
const bodyParser = require('body-parser');
const expressStatic = require('express-static');
const mongoose = require('mongoose')
const Msgs = require('./models/msg')

var https = require('https');
var fs = require('fs')
var privatekey = fs.readFileSync('cert/2_fancy-x.imwork.net.key', 'utf8');
var certificate = fs.readFileSync('cert/1_fancy-x.imwork.net_bundle.crt', 'utf8');
var options = {key: privatekey, cert: certificate};

mongoose.connect('mongodb://root:123456@127.0.0.1:27017/mind', {useNewUrlParser: true}, function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log("数据库连接成功");
	}
})
mongoose.connection.on("disconnected", function () {
	console.log("数据库已断开");
})

var server = express();
var app = https.createServer(options, server);
app.listen(443);

server.use(bodyParser.urlencoded({
		extended: false,                 //扩展模式，默认不开
		limit: 2 * 1024 * 1024           //限制-2M，默认100k
	})
)

server.get('/getmsg', function (req, res) {
	let page = req.query.page ? parseInt(req.query.page) : 1
	let skip = (page - 1) * 5
	Msgs.find().skip(skip).limit(5).exec(function (err, doc) {
		if (err) {
			res.send({
				status: 1,
				msg: err.message,
				data: '数据库查询错误'
			})
		} else {
			res.send({
				status: 0,
				msg: '',
				data: doc,
				page: page
			})
		}
	})
})

server.get('/getone', function (req, res) {
	let id = req.query.id
	Msgs.findOne({_id: id}, function (err, doc) {
		if (err) {
			res.send({
				status: 1,
				msg: err.message,
				data: '数据库查询错误'
			})
		} else {
			res.send({
				status: 0,
				msg: '',
				data: doc
			})
		}
	})
})

server.get('/comeon', function (req, res) {
	let id = req.query.id
	let count = parseInt(req.query.count)
	if (id && count !== undefined) {
		Msgs.updateOne({_id: id}, {$set: {comeOn: count}}, function (err, doc) {
			if (err) {
				res.send({
					status: 1,
					msg: err.message,
					data: '数据库查询错误'
				})
			} else {
				res.send({
					status: 0,
					msg: '',
					data: doc
				})
			}
		})
	} else {
		res.send({
			status: 1,
			data: '字段错误'
		})
	}
})

server.post('/send', function (req, res) {
	let time = req.body.time
	let username = req.body.username
	let content = req.body.content
	let location = req.body.location
	Msgs.find().sort({no: -1}).exec(function (err1, doc1) {
		if (err1) {
			res.send({
				status: 1,
				msg: err1.message,
				data: '数据库查询错误'
			})
		} else {
			var newMsg = new Msgs({
				no: doc1[0].no ? doc1[0].no + 1 : 1,
				time: time,
				username: username,
				content: content,
				location: location,
				comeOn: 0
			})
			newMsg.save(function (err2, doc2) {
				if (err2) {
					res.send({
						status: 1,
						msg: err2.message,
						data: '数据库添加失败'
					})
				} else {
					res.send({
						status: 0,
						msg: '',
						data: '发表成功',
						count: doc1.length + 1
					})
				}
			})
		}
	})
})

server.use(expressStatic('./www'))