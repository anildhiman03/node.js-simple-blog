var express = require('express');
var router = express.Router();

// to upload file
var multer = require('multer');
var upload = multer({dest:'./public/images'});

//db connection
var monogo = require('mongodb');
var db = require('monk')('localhost/nodeblog');



/* Save post comment. */
router.post('/add-comment', function(req, res, next) {
	
	var name = req.body.name;
	var email = req.body.email;
	var postid = req.body.postid;
	var body = req.body.body;
	var comment_date = new Date();
	
	req.checkBody('name','name is required').notEmpty();
	req.checkBody('email','email is required').notEmpty();
	req.checkBody('email','Valid email is required').isEmail();
	req.checkBody('body','body is required').notEmpty();
	
	var errors = req.validationErrors();
	if (errors) {

		var post = db.get('post');
		post.findById(postid,function(err,post){
			res.render('show',{
				'title':'post detail',
				'post' : post,
				'errors' : errors
			});
		});
	} else {
		var comment = {
			"name" : name,
			"email" : email,
			"body" : body,
			"comment_date" : comment_date
		}

		var post = db.get('post');
		post.update({
			"_id":postid
		},{
			$push:{
				"comment": comment
			}
		},function(error,document) {
			if (error) throw err;
			req.flash('success','comment posted successfully');
			res.location('/posts/show/'+postid);
			res.redirect('/posts/show/'+postid);
		})
	}
});


/* GET post. */
router.get('/show/:id', function(req, res, next) {
	var post = db.get('post');

	post.findById(req.params.id,function(err,post){
		res.render('show',{
			'title':'post detail',
			'post' : post
		});
	});
});


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
