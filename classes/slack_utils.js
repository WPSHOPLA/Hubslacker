
//    - -   REQUIRED MODULES    - -     //

var request = require('request')
var querystring = require('querystring');
var mongoose =  require('mongoose');
var env = require('dotenv').config(); 


var fs = require('fs');

//    - -   APP MODULES  - -     //
/*
 *  @param Oauth {} mongoDb schema for HS Oauth tokens
 */

var Database = require('../database/db.js');
var OauthTokens = require('../database/models/OauthTokens');
var messageMetaData = require('../database/models/messageMetaData');
var slackMetaData = require('../database/models/slackMetaData');


Database = Database();


//    - -   EXPORTS     - -     //

module.exports.Oauth = Oauth;
module.exports.getToken = getToken;
module.exports.listChannels = listChannels;
module.exports.postMessage = postMessage;


//    - -   ENV VARIABLES   - -     //

/*
 * @param client_id String - Slack client ID
 * @param client_secret String - Slack client secret
 * @param redirect_uri String - Oauth redirect
 */

var slack_client_id = process.env["SLACK_CLIENT_ID"];
var slack_client_secret = process.env["SLACK_CLIENT_SECRET"];
var slack_redirect_uri = process.env["SLACK_REDIRECT_URI"];



//    - -     METHODS       - -   //


function Oauth (row, req){


// TO-DO: ensure auth

 /*if(req.state !== row.slack_access.state){
    return false;
  } else {
*/
    var params = querystring.stringify({
      client_id : slack_client_id,
      client_secret : slack_client_secret,
      code : req.code,
      redirect_uri : slack_redirect_uri
    });

    var options = {
      method : "POST",
      headers : {
        "Content-Type" : "application/x-www-form-urlencoded"
      },
      uri : "https://slack.com/api/oauth.access?" + params
    }

    // get access token & insert into DB
    request(options, function(err, res, d){
      if(err) throw err;
      
      var body = JSON.parse(d);
      if(body.ok){
        
        // insert Oauth tokens into Oauth model
        Database.upsert(OauthTokens, 
        {
          slack_access : {
            access_token : body.access_token,
            scope : body.scope,
            user_id : row[0].user_id,
            team_name : body.team_name,
            team_id : body.team_id
          }
        }, row[0].user_id);

        // get channels list from Slack and upsert into SlackMetaData model
        listChannels(body.access_token, row[0].user_id);
        getUsers(body.access_token, row[0].user_id, null);
      }
    });

//  }*/
}

/*
 *  gets cached access token from DB and executes a callback
 */ 

function getToken (id, cb, data){
  OauthTokens.where({"user_id" : id}).then(function(d){
    cb(d[0].slack_access.access_token, id, data);
  });
}

/*
 *  gets channels from Slack API
 *  and upserts response into SlackMetaData table
 */

function listChannels (token, id) {

  var params = querystring.stringify({
    token : token
  });
  
  // Get channels from Slack API
  request({
      method : "GET",
      uri : "https://slack.com/api/channels.list?" + params
    }, 
    function(err, res, d){
      if(err) throw err;

      // upsert channels list
      Database.upsert(slackMetaData, 
        {
          channels : JSON.parse(d).channels
        },id);
    }
  );
}

function postMessage(token, id, message){
  id = null;

  message.token = token;

  var options = {
    uri : 'https://slack.com/api/chat.postMessage',
    method : 'POST',
    headers : {
      'Content-Type' : 'application/x-www-form-urlencoded'
    }
  }

  options.body = querystring.stringify(message);

  request(options, function(err, res, d){
    if(err) throw err;
  });
}

function getUsers(token, id, data){

  options = {
    method : "GET",
    uri : 'https://slack.com/api/users.list?token=' + token
  }

  request(options, function(err, res, d){
    if (err) throw err;
    parseUsers(JSON.parse(d).members, id);
  });

}

function parseUsers(members, id){
  users = {};
  members.forEach(function(d){
    if(!d.is_bot && d.profile.email !== null){
      users[d.id] = {};
      users[d.id].name = d.name;
      users[d.id].realname = d.realname;
      users[d.id].team_id = d.team_id;
      users[d.id].id = d.id;
      users[d.id].email = d.profile.email;
    }
  });
  Database.upsert(slackMetaData, { users : users }, id);
}
