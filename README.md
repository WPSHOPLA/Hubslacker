#HubSpot Lead Notifications for Slack

####Author: Henri

###Description: 

Receive lead notifications from HubSpot form submissions direct to a Slack Channel or a designated user.  Customize the information you receive in the notifications using the app.


##Server

Heroku

##DB

MongoDB

##Node Modules

Express - http://expressjs.com/en/4x/api.html

ejs - https://github.com/tj/ejs

Mongoose -  https://www.npmjs.com/package/mongoose
 - API DOCS - http://mongoosejs.com/docs/api.html


###Middleware

body-parser - https://www.npmjs.com/package/body-parser

cookie-parser - https://www.npmjs.com/package/cookie-parser

express-session - https://github.com/expressjs/session

connect-mongo - https://www.npmjs.com/package/connect-mongo (session logger)

csurf - https://www.npmjs.com/package/csurf

uuid - https://github.com/broofa/node-uuid

dot-env - https://www.npmjs.com/package/dotenv

passport-local-mongoose - https://github.com/saintedlama/passport-local-mongoose

###CSS framework

Skeleton.css - http://getskeleton.com/

Things I had to learn 

setting up an environment -> http://man7.org/linux/man-pages/man7/environ.7.html
CSRF protection
storing cookies in cache for user session
MongoDb
Oauth
ejs

Login -

https://github.com/saintedlama/passport-local-mongoose

http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/#.VxO_ixMrJE4

Session info -
 - https://glebbahmutov.com/blog/express-sessions/
 - http://blog.modulus.io/nodejs-and-express-sessions
 - https://www.codementor.io/nodejs/tutorial/cookie-management-in-express-js
 - http://scottksmith.com/blog/2014/09/04/simple-steps-to-secure-your-express-node-application/

 Node module patterns - http://www.sitepoint.com/understanding-module-exports-exports-node-js/

 http://fredkschott.com/post/2014/01/node-js-cookbook---constructors-and-custom-types/
 http://robdodson.me/javascript-design-patterns-singleton/

 MONGODB

 http://theholmesoffice.com/mongoose-connection-best-practice/

 http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/


 SECURITY 

 https://www.npmjs.com/package/helmet

 JS Module Patterns

 http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html


 SLACK APIS

  - Oauth - https://api.slack.com/docs/oauth
    - token request - https://api.slack.com/methods/oauth.access
    - Scoping - https://api.slack.com/docs/oauth-scopes
    - test connection code - https://api.slack.com/methods/api.test
    - test authToken - https://api.slack.com/methods/auth.test
  - Real Time Messaging API - https://api.slack.com/rtm
  - Bot user - https://api.slack.com/bot-users
  - Post message - https://api.slack.com/methods/chat.postMessage
  - List channels - https://api.slack.com/methods/channels.list


TO-DO

change password/username
set up helmet/csurf
check all auth
hash orgSecret in messageMetaData

WISHLIST

send to slack user based on HS owner

Thanks.
