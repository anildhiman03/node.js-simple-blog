var express = require('express');
var router = express.Router();

//db connection
var monogo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


/* GET home page. */
router.get('/', function(req, res, next) {
	var db = req.db;
	var posts = db.get('post');
	posts.find({},{},function(err,posts){
		console.log(posts);
  		res.render('index', { posts: posts });		
	});

});

module.exports = router;
