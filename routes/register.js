var express = require('express');
var ejs = require('ejs');
var passport = require('passport');
var User = require('../database/models/user');
var Database = require('../database/db');


var Database = Database();
var router = express.Router();

router.use(function(req, res, next){
  next();
});

router.get('/', function(req, res){
  if(Database.connection.readyState !== 1){
    Database.init();
  }
  if(req.user){
    res.redirect('/');
  } else {
    res.render('pages/register', {title : "Register | HubSlacker", error : null});
  }
  
});

router.post('/', function(req, res) {
  var status, error;

  // checks to make sure password matches 
  if(req.body.password !== req.body.confirm_password){
    res.status(400)
      .render('pages/register', {title : "Register | HubSlacker", error : 'Passwords do no match'});
  } else {

    // if match attempt to create a new user
    User.register(new User({username: req.body.username}), req.body.password, function(err, data) {
      
      if (err) {
        // if theres and error creating a user send it to the page and display for the user
        res.status(400)
          .render('pages/register', {title : "Register | LeadNotify", error : err});
      } else {

        // authenticates the registration and logs the user in then redirects to the settings page
        passport.authenticate('local')(req, res, function () {
          res.status(200);
          res.redirect('/');
        });
      }
    });
  }
});

module.exports = router;