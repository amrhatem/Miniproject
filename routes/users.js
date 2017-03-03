var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var  Project= require('../models/project');
var path = require('path');
var multer = require('multer');
var crypto = require('crypto');

/**
 * Multer Configurations
 */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
        const buf = crypto.randomBytes(48);
        cb(null, Date.now() + buf.toString('hex') + path.extname(file.originalname));
    }
});


const upload = multer({
    storage: storage
});

router.use(function(req, res, next) {
	
    res.locals.currentUser = req.user;	
    next();
});



router.post('/profile', upload.single('file'),function(req,res,next){
	if( req.file != undefined){
		var image = req.file.filename;
		req.user.image = image;

		req.user.save(function(err) {
        if (err) {
            next(err);
            res.render('/users/profile',{
			errors:errors
		});
            return;
        }
        console.log(req.user.image);
      
        res.redirect("/users/profile");
        	req.flash('success_msg', "Image uploaded");
       // window.alert('hi');
  //alert("image uploaded");
    });
	}

});
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
next();
} else {
var error = "You must be logged in to see this page.";
res.render('login',{
	error
});
}
}
router.get('/addproject', ensureAuthenticated,  function(req, res){
	res.render('addproject',{
		user:req.user
	});
});


router.post('/addproject',upload.single('file') ,function(req,res, next){
	var title = req.body.title;
	var url= req.body.url;
	var file = req.file;
	var username = req.user.username; 
	if(file == undefined && url == ""){
		var error='Please Submit either a URL or a file of your project!!';
		res.render('addproject',{
			error:error
		});
	}
	else
	if (title == ""){
         var error='Please write the title';
		res.render('addproject',{
			error:error
		});
	}
	else {
		var success_msg = 'Project added successfully.';
		var newProject = new Project({
			title: title,
			url :url,
			file :file,
			username :username
		});

		newProject.save();

		

		res.render('addproject',{
			success_msg:success_msg
		});
	}
	

});
// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

router.get('/profile', function(req,res){
	res.render('profile',{
		user:req.user
	});
});
// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//router.post('/login',
 // passport.authenticate('local', {successRedirect:'/users/profile', failureRedirect:'/users/login',failureFlash: true}),
//  function(req, res) {
  //  res.redirect('profile');
  //});
  router.post('/login',
  passport.authenticate('local', {successRedirect:'/users/profile', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('profile');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;