let express = require('express')
let session = require('express-session')
let Grant = require('grant-express')
let grant = new Grant(require('../oauth.json'))

let aidOfLogedInUsers = new Set();

//oAuth
exports.createOAuthServer = function(app){
  app.use(session({secret:'very secret'}));
  app.use(grant);
  
  app.get('/userdevices', function (req, res) {
    var username=req.session.username;
    res.write("You have been successfully logged-in as " + username +". You can close this tab.");
    res.end();
  });

  app.get('/handle_amazon_callback', function (req, res) {
    https.request({
      host: 'api.amazon.com',
      path: '/user/profile',
      headers:{
        "Authorization": "bearer " + req.query.access_token
      }
    }, function(response) {
      let str = '';
      response.on('data', function (chunk) { str += chunk })
      response.on('end', function () {

      addUser(str)

      let au = JSON.parse(str)
      usr = getUserByAmazonId(au['user_id'])
      if(usr !== undefined){
        //send request from alexa to user`s socket
        console.log('send user data to client')
        io.to(usr._sid).emit('login', str)
      }
      
      req.session.username=JSON.parse(str).name;
      res.writeHead(302, {'Location': '/userdevices'});
        res.end();
      });
    }).end();
  })
}

function addUser(userId) {
  aidOfLogedInUsers.add(userId);
}