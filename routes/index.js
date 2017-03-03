var express = require('express');
var router = express.Router();
var User = require('../models/user');
// Get Homepage
//, ensureAuthenticated
router.get('/', function(req, res){
	User.find().exec((err,users)=>{
		if(err){next(err);return;}
		res.render('index', users);
	})
	 

});

//function ensureAuthenticated(req, res, next){
	//if(req.isAuthenticated()){
	//	return next();
	//} else {
		//req.flash('error_msg','You are not logged in');
	//	res.redirect('/users/login');
	//}
//}


 

//
module.exports = router;