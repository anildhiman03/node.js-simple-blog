var express = require('express');
var router = express.Router();

// to upload file
var multer = require('multer');
var upload = multer({dest:'./uploads'});

//db connection
var monogo = require('mongodb');
var db = require('monk')('localhost/nodeblog');


/* GET post. */
router.get('/add', function(req, res, next) {
	var categories = db.get('categories');

	categories.find({},{},function(err,categories){
		res.render('add-post',{
			'title':'Add Post',
			'categories' : categories
		});
	});
});

/* POST post. */
router.post('/add', upload.single('mainimage'),function(req, res, next) {
	//form validations
	var title = req.body.title;
	var body = req.body.body;
	var category = req.body.category;
	var author = req.body.author;
	var date = new Date();
	console.log(title);


	// image checking : in case image not uploaded save noimage.jpg
	if(req.file){
	  	console.log('Uploading File...');
	  	var mainimage = req.file.filename;
	} else {
	  	console.log('No File Uploaded...');
	  	var mainimage = 'noimage.jpg';
	}

	// validation 
	req.checkBody('title','Title is required').notEmpty()
	req.checkBody('body','Body is required').notEmpty()
	
	var errors = req.validationErrors();

	if (errors) {
		console.log(errors);
		res.render('add-post',{errors:errors});
	} else {

		// db instance
		var db = req.db;
		var posts = db.get('post');
		
		// save data
		posts.insert({
			"title" : title,
			"body" : body,
			"category" : category,
			"author" : author,
			"date" : date,
			"mainimage" : mainimage
		},function(err,post){
			if (err) {
				res.send(err);
			} else {
				req.flash('success','Post posted successfully');
				res.location('/');
				res.redirect('/');
			}
		});
	}

});

module.exports = router;
