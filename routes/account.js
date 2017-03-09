
/*
 *    - -       ACCOUNT PAGE HANDLING  - -     *//*
 *           
 */


//    - -   REQUIRED MODULES    - -     //

var express = require('express');
var ejs = require('ejs');
var passport = require('passport');
var env = require('dotenv').config(); 


//    - -   APP MODULES  - -     //

/*
 *  @param Database {} mongoDb connection
 *  @param User {} mongoDb schema for User creds
 *  @param Oauth {} mongoDb schema for HS Oauth tokens
 */

var Database = require('../database/db')();
var User = require('../database/models/user');
var OauthTokens = require('../database/models/OauthTokens');

var router = express.Router();



router.use(function(req, res, next){
  next();
})


//    - -   GET REQUESTS     - -     //


router.get('/', function(req, res){
  if(!req.user){
    res.redirect('/login');
  } else {
    // if Database connection is not open DB.init
    if(Database.connection.readyState !== 1){
      Database.init();
    }

   // look for an existing token
    OauthTokens.where('user_id', req.user.id).then(function(d){

      // @param Oauth {} -  describes auth states //
      var Oauth = {
        hs : false,
        slack : false
      };

      // @param row {} - DB response if any //
      var row = d[0];

      // set Auth states
      if (row.hs_access.refresh_token){
        Oauth.hs = true;
      }
      if (row.slack_access.access_token){
        Oauth.slack = true;
      }   

      res.render('pages/account', {title : "Accounts | HubSlacker", user : req.user, Oauth : Oauth});

    });
  }
})

/*
 *    - -   POST REQUESTS     - -     *//*
 */

router.post('/', function(req, res){
  res.status(405);  // POST REQUESTS NOT ACCEPTED AT THIS PATH
});


module.exports = router;
