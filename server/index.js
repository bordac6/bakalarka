var assert = require('assert')
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var request = require('request')
var Grant = require('grant-express')
var grant = new Grant(require('./oauth.json'))
var https = require('https')
var session = require('express-session')
var port = process.env.PORT || 3000
var alexaRes = {}
var responseToAlexa = {}
var clients = []

class User{
  constructor(amazonId=null, socketId=null, socket=null, email=null){
    this._aid = amazonId
    this._sid = socketId
    this._socket = socket
    this._email = email
  }
  get aid(){
    return this._aid
  }
  get sid(){
    return this._sid
  }
  get email(){
    return this._email
  }
  addAmazonId(amazonId){
    this._aid = amazonId
  }
  addSocketId(socketId){
    this._sid = socketId
  }
  addSocket(socket){
    this._socket = socket
  }
  addEmail(email){
    this._email = email
  }
}

// Creates the website server on the port #
server.listen(port, function () {
  console.log('Server listening at port %d', port);
  console.log('Clients connected to server: ', clients)
});

// Handles the route for echo apis
app.post('/api/echo', function(req, res){
  console.log("received echo request");
  var requestBody = "";
  // Will accumulate the data
  req.on('data', function(data){
    requestBody+=data;
  });

  // Called when all data has been accumulated
  req.on('end', function(){

    //send data to client
    let jsonBody = JSON.parse(requestBody)
    let aid = jsonBody.session.user.accessToken
    //if alexa is not linked with amazon account, ask for link account
    if(!aid){
      requestBody = {
        "version": "1.0",
        "response": {
          "outputSpeech": {
            "type": "PlainText",
            "text": " Please use the companion app to authenticate on Amazon to start using this skill"
          },
          "card": {
            "type": "LinkAccount"
          },
          "shouldEndSession": false
        },
        "sessionAttributes": {}
      };
      res.statusCode = 200;
      res.contentType('application/json');
      res.send(responseBody);
    } 
    //account linked
    else {
      //get user`s amazon account ID
      var amznProfileURL = 'https://api.amazon.com/user/profile?access_token='
      amznProfileURL += aid
      request(amznProfileURL, function(error, response, body){
        if(response.statusCode == 200){
          let profile = JSON.parse(body)
          let user_id = profile.user_id
          console.log('user id on line 96: ', user_id)
          //get user by ID
          let usr = getUserByAmazonId(user_id)
          if(usr !== null){
            //send request from alexa to user`s socket
            io.to(usr._sid).emit('message', requestBody)

            //wait for response from client and send to Alexa
            setTimeout(() => {      
              if(alexaRes[user_id]){
                res.statusCode = 200;
                res.contentType('application/json');
                res.send(alexaRes[user_id]);
                delete alexaRes[user_id]
              }
              else {
                responseBody = {
                  "version": "0.1",
                  "response": {
                    "outputSpeech": {
                      "type": "PlainText",
                      "text": "Client is Unreachable"
                    },
                    "card": {
                      "type": "Simple",
                      "title": "DoCommand",
                      "content": "Can't connect to client."
                    },
                    "reprompt": {
                      "outputSpeech": {
                        "type": "PlainText",
                        "text": "Say a command"
                      }
                    },
                    "shouldEndSession": false
                  }
                }
              } 
            }, 500) 
          }
          else{
            console.log('User is not connected')
          }
        }
        else{
          console.log(error)
        }
      })
    }   
  })
})

//oAuth
app.use(session({
  secret:'very secret'
 }));
 app.use(grant);
 
 app.get('/userdevices', function (req, res) {
  var userid=req.session.userid;
  res.write(userid);
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
   var str = '';
   response.on('data', function (chunk) {
    str += chunk;
   });
   response.on('end', function () {
    addUser(str)
    var au = JSON.parse(str)
    usr = getUserByAmazonId(au['user_id'])
    if(usr !== null){
      //send request from alexa to user`s socket
      console.log('send user data to client')
      io.to(usr._sid).emit('login', str)
    }
    //console.log('Users after added one: ', clients)
    req.session.userid=JSON.parse(str).user_id;
    res.writeHead(302, {'Location': '/userdevices'});
     res.end();
   });
  }).end();
 })

//socket.io
io.on('connect', (socket) => {
    console.log('New client on socket is connected.')
/**
 * room: name of chanel for communication with clients
 * email : loggin email to amazon
 * callback: function with one string for message to clien
 */
    socket.on('room', (room, usr, callback) => { 
      //loggin check
      au = JSON.parse(usr)
      email = au['email']
      aid = au['user_id']
      if(isLoggedIn(email)){
        user = getUserByEmail(email)
        if(isConnectedUser(email)){ //connection second time
          user._socket.disconnect()
        }
        user.addSocketId(socket.id)
        user.addSocket(socket)
        if(aid !== null){
          user.addAmazonId(aid)
        }
        socket.join(room)
        clients.push(user)
        callback('yes')
      }
      else{
        user = getUserByEmail(email)
        if(user === null){ //shoul`d be here in first time
          var msg = 'Wait for amazon loggin.'
          user = new User()
          user.addEmail(email)
          if(aid !== null){
            user.addAmazonId(aid)
            msg = 'Succesfully logged in.'
          }
          user.addSocket(socket)
          user.addSocketId(socket.id)

          socket.join(room)
          clients.push(user)
          callback(msg)
        }
        else{ 
          callback('Not yet logged with amazon.')
          socket.disconnect()
        }
      }
    })

    socket.on('disconnect', () => {
        var usr = getUserBySocketId(socket.id)
        var index = clients.indexOf(usr)
        if(index > -1) clients.splice(index, 1)
        console.log('Client disconnected.')
        console.log(clients)
    })
    socket.on('alexaRes', (req, res) => {
      //check req is acceptable
        let usr = getUserBySocketId(socket.id)
        if(usr != null){
          alexaRes[usr._aid] = req
          res("OK")
        }
        else{
          res("NO")
        }
    })
})

function getUserBySocketId(socketId){
  for(user of clients){
    if(user._sid === socketId){
      return user
    }
  }
  return null
}
function getUserByAmazonId(amazonId){
  if(amazonId === null)
    return null
  for(user of clients){
    if(user._aid === amazonId){
      return user
    }
  }
  return null
}
function getUserByEmail(email){
  if(email === null)
    return null
  for(user of clients){
    if(user._email === email){
      return user
    }
  }
  return null
}
function isConnectedUser(email){
  if(email === null)
    return false
  for(user of clients){
    if(user._email === email && user._aid !== null && user._sid !== null){
      return true
    }
  }
  return false
}
function isLoggedIn(email){
  if(email === null)
    throw false
  for(user of clients){
    if(user._email === email && user._aid !== null){
      return true
    }
  }
  return false
}
function addUser(amazonUser){
  au = JSON.parse(amazonUser)
  for(user of clients){
    if(user._email === au['email']){
      user.addAmazonId(au['user_id'])
      return true
    }
  }
  user = new User()
  user.addAmazonId(au['user_id'])
  user.addEmail(au['email'])
  clients.push(user)
  return true
}