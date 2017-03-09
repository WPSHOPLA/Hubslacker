/*
 *    - -       API FOR UPDATING MESSAGE METADATA  - -     *//*
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

var Database = require('../../database/db');
var User = require('../../database/models/user');
var OauthTokens = require('../../database/models/OauthTokens');
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


router.get('/meta', function(req, res){
  
  // sends organization ID to client
  messageMetaData.where({"user_id" : req.user.id}).then(function(d){
    res.status(200).send(d[0].organization.username);
    res.end();
  });   
  
});

/*
 *    - -   POST REQUESTS     - -     *//*
 */

router.post('/update', function(req, res){

  // updates message metadata collection in MongoDb
  Database.upsert( messageMetaData, 
  { organization : 
    {
      username : req.body.username,
      password : req.body.password
    }
  }, req.user.id );

  // gets HubSpot access token
  hsUtils.get_token(
    req.user.id, 
    
    // sends callback getToken method to create workdlow
    hsUtils.createWorkflow, 
    {
      username : req.body.username,
      password : req.body.password
    });
  res.status(200).end();
});


module.exports = router;