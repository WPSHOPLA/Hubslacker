/*
 *    - -       API FOR HUBSPOT RELATED REQs  - -     *//*
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

// returns cached properties from DB
router.get('/properties', function(req, res){
  if(!req.user){
    res.redirect('/login');
  } else {

    // searches hubspotMetaData collection for logged in user
    hubspotMetaData.where({'user_id' : req.user.id}).then(function(d){
      res.status(200).send(
        {
          property_group : d[0].property_group,
          properties : d[0].properties,
          selected_properties : d[0].selected_properties
        });
      res.end();
    });
  }
});

/*
 *    - -   POST REQUESTS     - -     *//*
 */


// receives webhook from HubSpot with new lead notification
router.post('/lead', function(req, res){
  
  var authHeader, orgId, orgSecret, properties, row;

  // parses auth header in request
  authHeader = new Buffer(req.headers.authorization.toString().split(' ')[1], 'base64').toString('ascii');
  orgId = authHeader.split(':')[0];
  orgSecret = authHeader.split(':')[1];


  // collects contact record from request body and the URL to the contact record in the HubSpot App
  response = req.body.properties;
  response['profile-url'] = req.body['profile-url'];


  // searches database for org ID and secret
  messageMetaData.find({ 'organization.username' : orgId, 'organization.password' : orgSecret}, function(err, d){
    if(err) console.log(err);
    
    // if org ID and secret are not found send error
    if(!d.length){
      res.status(401).send("Unauthorized").end();
    } else {

      // else send the req.body to hsUtils class to be parsed by the formatNewLeadPostBody method
      org = d[0].organization;
      hsUtils.formatNewLeadPostBody(d[0].user_id, d[0], response);
      res.status(200).end();
    }
  });

});

// updates cached default properties
router.post('/properties/default', function(req, res){


  // if there are changes to the default properties list
  if(req.body.default_properties !== undefined){
    
    // cycle through each of the properties and upsert into Database
    req.body.default_properties.forEach(function(d){
        
        name = `properties.${d.name}.default_selection`;
        data = {};
        data[name] = d.default_selection;

        // adds property as default selection to messageMetadata collection in mongodb
        if(d.default_selection === true || d.default_selection === 'true'){
          messageMetaData.update({user_id : req.user.id},
            {
              $push : { selected_properties : d.name }
            }, function(err){
              if(err) console.log(err);
            });
        } else {

          // removes property as default selection to messageMetadata collection in mongodb
          messageMetaData.update({user_id : req.user.id},
            {
              $pull : { selected_properties : d.name }
            }, function(err){
              if(err)console.log(err);
            });
        }
        
        // updates the hubspotMetaData collection in mongodb
        Database.upsert(hubspotMetaData, data, req.user.id);

    });
    }
  res.status(200).end();
});

module.exports = router;
