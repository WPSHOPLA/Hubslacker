/*
 *    - -       API OWNERS/USERS  - -     *//*
 *           
 */


//    - -   REQUIRED MODULES    - -     //

var express = require('express');
var ejs = require('ejs');
var passport = require('passport');


//    - -   APP MODULES  - -     //

/*
 *  @param Database {} mongoDb connection
 *  @param User {} mongoDb schema for User creds
 *  @param OauthTokens {} mongoDb schema for Oauth tokens
 */

var Database = require('../../database/db')();
var User = require('../../database/models/user');
var OauthTokens = require('../../database/models/OauthTokens');
var hubspotMetaData = require('../../database/models/hubspotMetaData');
var slackMetaData = require('../../database/models/slackMetaData');
var messageMetaData = require('../../database/models/messageMetaData');


//    - -   REQUIRED METHODS  - -     //

var hsUtils = require('../../classes/hs_utils');
var slackUtils = require('../../classes/slack_utils');

var router = express.Router();


router.use(function(req, res, next){
	next();
})

/*
 *    - -   GET REQUESTS     - -     *//*
 */
router.get('/', function(req, res){
	

  // TO-DO check cookie in req.headers to confirm auth
  if(!req.user){
    res.redirect('/login');
  } else {
  
    res.end();
  }
});



/*
 *    - -   POST REQUESTS     - -     *//*
 */



module.exports = router;
