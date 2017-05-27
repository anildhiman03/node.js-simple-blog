var express = require('express');
var router = express.Router();

//db connection
var monogo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:category', function(req, res, next) {
	var post = db.get('post');

	post.find({category:req.params.category},{},function(err,posts){
		res.render('index',{
			'title':req.params.category,
			'posts' : posts
		});
	});
});

/* show Category page. */
router.get('/add', function(req, res, next) {
	res.render('add-category',{
		'title':'Add Category'
	});
});

/* POST Category. */
router.post('/add', function(req, res, next) {
	//form validations
	var name = req.body.name;
	
	// validation 
	req.checkBody('name','Name is required').notEmpty()
	
	var errors = req.validationErrors();

	if (errors) {
		console.log(errors);
		res.render('add-category',{errors:errors});
	} else {

		// db instance
		var db = req.db;
		var cat = db.get('categories');
		
		// save data
		cat.insert({
			"name" : name,
		},function(err,post){
			if (err) {
				res.send(err);
			} else {
				req.flash('success','Category added successfully');
				res.location('/');
				res.redirect('/');
			}
		});
	}

});

module.exports = router;
