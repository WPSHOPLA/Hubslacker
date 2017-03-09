/*
 *    - -       API FOR SLACK  - -     *//*
 *           
 */


//    - -   REQUIRED MODULES    - -     //

var express = require('express');
var ejs = require('ejs');
var passport = require('passport');
var mongoose = require('mongoose');


//    - -   APP MODULES  - -     //

/*
 *  @param Database {} mongoDb connection
 *  @param User {} mongoDb schema for User creds
 *  @param OauthTokens {} mongoDb schema for Oauth tokens
 */

var Database = require('../../database/db');
var User = require('../../database/models/user');
var OauthTokens = require('../../database/models/OauthTokens');
var slackMetaData = require('../../database/models/slackMetaData');
var messageMetaData = require('../../database/models/messageMetaData');


//    - -   REQUIRED METHODS  - -     //

var hsUtils = require('../../classes/hs_utils');
var slackUtils = require('../../classes/slack_utils');



var Database = Database();
var router = express.Router();


router.use(function(req, res, next){
  if(!req.user){
    res.redirect('/login');
  } else {
	 next();
  }
})

/*
 *    - -   GET REQUESTS     - -     *//*
 */


router.get('/', function(req, res){
  //res.status(200).send(slackUtils.getToken(req.user.id, slackUtils.listChannels));
  res.end();
});

// get saved channels from DB
router.get('/channels', function(req, res){
  
  slackMetaData.where({"user_id" : req.user.id}).then(function(d){
    res.status(200).send({channels : d[0].channels, default_channel : d[0].default_channel});
    res.end();
  })	

});



/*
 *    - -   POST REQUESTS     - -     *//*
 */

// Sets the default channel
router.post('/channels/set', function(req, res){

  // log slack metadata
  Database.upsert( slackMetaData, { default_channel: req.body.default_channel }, req.user.id );

  // log notification metadata
  Database.upsert( messageMetaData, { default_channel: req.body.default_channel }, req.user.id );

  res.status(200);
  res.end();
});


module.exports = router;