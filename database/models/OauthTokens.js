var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var OauthTokens = new Schema({
  user_id : String,
  hs_access : {
    refresh_token : String,
    refreshed : {type : Date} 
  },
  slack_access : {
  	state : String,
    access_token : String,
    scope : String,
    user_id : String,
    team_name : String,
    team_id : String
  }
});	

module.exports = mongoose.model('OauthTokens', OauthTokens);