var express = require('express');
var ejs = require('ejs');
var passport = require('passport');
var User = require('../database/models/user');
var Database = require('../database/db')();

var router = express.Router();


router.use(function(req, res, next){
	next();
});

router.get('/', function(req, res){

	if(Database.connection.readyState !== 1){
		Database.init();
	}
  res.render('pages/login', {title : "Login", user : req.user});
  
});

// logs user in
router.post('/', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});

module.exports = router;