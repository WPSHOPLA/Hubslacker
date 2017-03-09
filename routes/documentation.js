/*
 *    - -       DOCUMENTATION PAGE HANDLING  - -     *//*
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

var Database = require('../database/db')();
var User = require('../database/models/user');
var OauthTokens = require('../database/models/OauthTokens');


//    - -   REQUIRED METHODS  - -     //

var hsUtils = require('../classes/hs_utils');
var slackUtils = require('../classes/slack_utils');


var router = express.Router();


router.use(function(req, res, next){
	next();
})

/*
 *    - -   GET REQUESTS     - -     *//*
 */
router.get('/', function(req, res){
	res.render('pages/documentation', {	title : "Documentation | HubSlacker", user : req.user });
});

/*
 *    - -   POST REQUESTS     - -     *//*
 */

router.post('/', function(req, res){
  res.status(405);  // POST REQUESTS NOT ACCEPTED AT THIS PATH
});


module.exports = router;