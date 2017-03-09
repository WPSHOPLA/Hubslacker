
/*
 *    - -       SLACK AUTH HANDLING   - -     *//*
 *             
 */

//    - -   REQUIRED MODULES    - -     //

var express = require('express');
var ejs = require('ejs');
var passport = require('passport');
var querystring = require('querystring');
var env = require('dotenv').config(); 
var uuid = require('node-uuid'); 

//    - -   APP MODULES  - -     //

/*
 *  @param Database {} mongoDb connection
 *  @param User {} mongoDb schema for User creds
 *  @param Oauth {} mongoDb schema for HS Oauth tokens
 */

var Database = require('../database/db')();
var User = require('../database/models/user');
var OauthTokens = require('../database/models/OauthTokens');


//    - -   REQUIRED METHODS  - -     //

var Oauth = require('../classes/slack_utils').Oauth;


//    - -   INIT ROUTER  - -     //

var router = express.Router();


//    - -   ENV VARIABLES   - -     //


/* @param HOST String - host
 * @param PORT Number - port
 * @param auth_params {} - query params for Slack auth call
 * @param slack_auth_uri String - Oauth URI
 * @param client_id String - Slack client ID
 * @param client_secret String - Slack client secret
 * @param scope String - Slack Oauth scoping
 * @param redirect_uri String - Oauth redirect
 * @param auth_uri String - Slack auth uri
 */

var HOST = process.env["HOST"];
var PORT = process.env["PORT"];
var slack_auth_uri = process.env["SLACK_AUTH_URI"];

var auth_params = querystring.stringify({
  client_id : process.env["SLACK_CLIENT_ID"],
  client_secret : process.env["SLACK_CLIENT_SECRET"],
  scope : process.env["SLACK_SCOPE"],
  redirect_uri : process.env["SLACK_REDIRECT_URI"]
});

var auth_uri = slack_auth_uri +"?"+ auth_params;



router.use(function(req, res, next){
	next();
})


/*
 *    - -   GET REQUESTS     - -     *//*
 */

router.get('/', function(req, res){
  
  // if Database connection is not open init
  if(Database.connection.readyState !== 1){
    Database.init();
  }

  // redirect if not logged in 
  if(!req.user){
    res.redirect('/login');
  } else {

    // if state is passed as a param in GET request - make exchange for Access Token
    if(req.query.state){
      OauthTokens.where({ "user_id" : req.user.id }).then(function (d) {
        Oauth(d, req.query);
      });
    }

    res.redirect('/account');
    res.end();
  }
  
});


/*
 *    - -   POST REQUESTS     - -     *//*
 */

router.post('/', function(req, res){
  
  // on client request to connect SLACK
  if(req.body.authorize){
    
    
    // @param auth_state - validates incoming res from Slack
    var auth_state = uuid.v4();

    // upsert SLACK Oauth params
    Database.upsert(OauthTokens, 
      {
        slack_access : {
          state : auth_state,
          code : null
        }
      }, 
      req.user.id);
 
    res.redirect(auth_uri + "&state=" + auth_state);
    res.end();
  }

  // on client request to disconnect SLACK
  if(req.body.slackDisconnect){

    // update Oauth Params
    Database.upsert(OauthTokens,
      {
        slack_access : {
          code : null,
          state : null
        }
      }, req.user.id);
    res.status(200);
    res.redirect('/account'); 
  }

  

});


module.exports = router;