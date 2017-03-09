
//    - -   REQUIRED MODULES    - -     //

var request = require('request')
var querystring = require('querystring');
var mongoose =  require('mongoose');


var fs = require('fs');

//    - -   APP MODULES  - -     //
/*
 *  @param Oauth {} mongoDb schema for HS Oauth tokens
 */

var Database = require('../database/db')();
var slackUtils = require('./slack_utils');
var OauthTokens = require('../database/models/OauthTokens');
var hubspotMetaData = require('../database/models/hubspotMetaData');
var messageMetaData = require('../database/models/messageMetaData');


//    - -   EXPORTS     - -     //

module.exports.get_token = get_token;
module.exports.refresh = refresh;
module.exports.getContactProperties = getContactProperties;
module.exports.formatNewLeadPostBody = formatNewLeadPostBody;
module.exports.createWorkflow = createWorkflow;
module.exports.getOwners = getOwners;


//    - -   ENV VARIABLES   - - //
/*
 *  @param TTL String - refresh token TTL
 */

var TTL = process.env["TTL"];



//    - -   METHODS     - -   //


// gets cached refresh token
function get_token (id, cb, data) {

  OauthTokens.where("user_id", id).then(function(d){

    var refreshToken = d[0].hs_access.refresh_token;

    refresh(refreshToken, id, OauthTokens, cb, data);
  });  

}


// gets a new access token
function refresh(refreshToken, id, OauthTokens, cb, data){

  // post body
  var body =  querystring.stringify({
    refresh_token: refreshToken,
    client_id :process.env["HS_CLIENT_ID"],
    grant_type : "refresh_token"
  });

  // POST to HS auth api
  request({
    method: "POST",
    uri : "https://api.hubapi.com/auth/v1/refresh",
    body : body
    }, 
    function(err, res, d){
      if(err) console.log(err);
      
      var responseBody = JSON.parse(d);

      // execute callback
      cb(responseBody.access_token, id, data);

      // inserts new refresh token
      Database.upsert(OauthTokens,
        {
          hs_access : {
            //access_token: responseBody.access_token,
            refresh_token: responseBody.refresh_token,
            //refreshed : new Date()
          }
        }, 
      id);
    }
  )

}


// lists all HubSpot Contact properties
function getContactProperties(accessToken, id){


  options = {
    method : "GET",
    uri : "https://api.hubapi.com/contacts/v2/properties?access_token=" + accessToken
  }

  // GET request
  request(options, function(err, res, d){
    if(err) console.log(err);
    formatContactProperties(JSON.parse(d), id);
  });

}

function formatContactProperties(d, id){
  
  var properties = {};
  var property_group = [];
  var upsertObj = {};

  
  d.forEach(function(d){
    property_group.push(d.groupName);
    if(!d.hidden){
      properties[d.name] = {
        name : d.name,
        label : d.label,
        groupName : d.groupName,
        default_selection : (function(name){
          if(name === 'firstname' || name === 'lastname' || name === 'email' || name === 'phone'){
            return true;
          } return false;
        })(d.name)
      };
    }
  });

  upsertObj.properties = properties;
  
  // removes duplicate entries from properties array
  upsertObj.property_group = property_group.filter( function( item, index, inputArray ) {
    return inputArray.indexOf(item) == index;
  });


  // updates MetaData tables
  Database.upsert(hubspotMetaData, upsertObj, id);
  Database.upsert(messageMetaData, { selected_properties : ['firstname', 'lastname', 'email', 'phone']}, id);
}

function formatNewLeadPostBody (id, metaData, post){
  var text, message;
  message = {};
  message.channel = metaData.default_channel;
  message.username = "HubSlacker";
  message.text = '*You have a new lead!*\n';

  metaData.selected_properties.forEach(function(d){
    if(post['firstname'] && d === 'firstname'){
      message.text += `${post[d].value} `;
      if(post['lastname']){
        message.text += `${post['lastname'].value}\n`;
      }
    }
    if(post[d]){
      if(d !== 'firstname' && d !== 'lastname')
        message.text += `*${d}:* ${post[d].value}\n`;
      }
  });

  message.text += `see the record here:\n${post['profile-url']}`;

  slackUtils.getToken(id, slackUtils.postMessage, message);
}

function createWorkflow(token, id, data){
  var options;
  options = {
    uri : 'https://api.hubapi.com/automation/v3/workflows?access_token=' + token,
    method : 'POST',
    headers : {
      "Content-Type" : "application/json"
    }
  };
  options.body = JSON.stringify({
    "name": "HubSlacker",
    "type": "DRIP_DELAY",
    "enabled" : "true",
    "actions": [
      {
        "type": "WEBHOOK",
        "url": "https://hs-slack-leadnotify.herokuapp.com/api/hubspot/lead",
        "method": "POST",
        "authCreds": {
          "user": data.username,
          "password": data.password
        }
      }
    ],
    "segmentCriteria": [[
      {
          "filterFamily": "FormSubmission",
          "withinTimeMode": "PAST",
          "operator": "HAS_FILLED_OUT_FORM"
      }]
    ],
    "allowContactToTriggerMultipleTimes" : "true",
    "reEnrollmentTriggerSets": [[{
          "type": "FORM"
        }]]
  });
  request(options, function(err, res, d){
    if(err) throw err;
  });
}

function getOwners (accessToken, id){
  var options = {
    uri : 'http://api.hubapi.com/owners/v2/owners?access_token=' + accessToken,
    method : 'GET'
  };

  request(options, function(err, res, d){
    if(err) throw err;
    var owners = {};
    JSON.parse(d).forEach(function(d){
      if(d.type === 'PERSON') {
        owners[d.ownerId] = {};
        owners[d.ownerId].email = d.email;
        owners[d.ownerId].ownerId = d.ownerId;
        owners[d.ownerId].firstName = d.firstName;
        owners[d.ownerId].lastName = d.lastName;
      }
    });
    Database.upsert(hubspotMetaData, { owners : owners }, id);
  });
}

