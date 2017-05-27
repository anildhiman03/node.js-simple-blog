var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

// to upload file
var multer = require('multer');
var upload = multer({dest:'./public/images'});

var moment = require('moment');
var expressValidator = require('express-validator');

//db connection
var monogo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

//routes
var index = require('./routes/index');
var posts = require('./routes/posts');
var categories = require('./routes/categories');

var app = express();


// common method to substring text
app.locals.truncateText = function (text,length) {
  var trcutatedText = text.substring(0,length);
  return trcutatedText;
}

// making moment to use globally to format date anywhere in project
app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//session
app.use(session({
	secret:'secret',
	saveUninitialized:true,
	resave:true
}));


// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//connect flash
app.use(require('connect-flash')());
app.use(function(req,res,next){
	res.locals.messages = require('express-messages')(req,res);
	next();
})

// accissible db to everyone
app.use (function (req,res,next){
	req.db = db;
	next();
})

app.use('/', index);
app.use('/posts', posts);
app.use('/categories',categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
