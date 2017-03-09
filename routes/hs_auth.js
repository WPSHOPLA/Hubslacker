
/*
 *    - -       HUBSPOT AUTH HANDLING   - -     *//*
 *            
 */



//    - -   REQUIRED MODULES    - -     //

var express = require('express');
var session = require('express-session');
var ejs = require('ejs');
var passport = require('passport');
var env = require('dotenv').config(); 
var querystring = require('querystring');


//    - -   APP MODULES  - -     //

/*
 *  @param Database {} mongoDb connection
 *  @param User {} mongoDb schema for User creds
 *  @param Oauth {} mongoDb schema for HS Oauth tokens
 */

var Database = require('../database/db')();
var User = require('../database/models/user');
var OauthTokens = require('../database/models/OauthTokens');
var hsUtils = require('../classes/hs_utils');

var router = express.Router();


//    - -   ENV VARIABLES   - -     //

/* 
 * @param HOST String - host
 * @param PORT Number - port
 * @param hs_auth_uri String - Hubspot Oauth URI
 * @param auth_params {} - query params for Slack auth call
 * @param client_id String - Slack client ID
 * @param client_secret String - Slack client secret
 * @param scope String - Slack Oauth scoping
 * @param redirect_uri String - Oauth redirect
 * @param auth_uri String - Slack auth uri
 *
 */

var HOST = process.env["HOST"];
var PORT = process.env["PORT"];
var hs_auth_uri = process.env["HS_AUTH_URI"];

var auth_params = querystring.stringify({
  client_id : process.env["HS_CLIENT_ID"],
  client_secret : process.env["HS_CLIENT_SECRET"],
  scope : process.env["HS_SCOPE"],
  redirect_uri : process.env["HS_REDIRECT_URI"]
});

var auth_uri =  hs_auth_uri +"?"+ auth_params;


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
    

    // upsert HUBSPOT Oauth params in DB
    Database.upsert(OauthTokens, 
      {
        hs_access : {
          refresh_token : req.query.refresh_token,
          refreshed : new Date()
        }
      }, req.user.id);

    // collects contact properties when user authorizes HubSpot
    hsUtils.getContactProperties(req.query.access_token, req.user.id);
    hsUtils.getOwners(req.query.access_token, req.user.id);

    res.redirect('/account');
    res.end();
  } 
});


/*
 *    - -   POST REQUESTS     - -     *//*
 */

router.post('/', function(req, res){
  
  // on client request to connect HUBSPOT
  if(req.body.authorize){
    var portalId = "&portalId=" + req.body.portalId;
    res.redirect(auth_uri + portalId);
    res.end();
  }
  
  // on client request to disconnect HUBSPOT
  if(req.body.hubspotDisconnect){

    // upsert HUBSPOT Oauth params in DB
    Database.upsert(OauthTokens,
    {
      hs_access : {
        refresh_token : null,
        refreshed : null
      }
    }, req.user.id);
    res.redirect('/account');
    res.end();
  }
});


module.exports = router;