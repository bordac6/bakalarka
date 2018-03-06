var assert = require('assert')
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var port = process.env.PORT || 3000
var alexaRes = {}
var responseToAlexa = {}
var clients = []

class User{
  constructor(amazonId = '', socketId = '', socket = ''){
    this._aid = amazonId
    this._sid = socketId
    this._socket = socket
  }
  get aid(){
    return this._aid
  }
  get sid(){
    return this._sid
  }
}

var mongo = require('./mongoUtil')
mongo.connectToServer(err => {
  if(err)
    console.log('Unable connect to database', err)
  var db = mongo.getDb()

// Creates the website server on the port #
server.listen(port, function () {
  console.log('Server listening at port %d', port);
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
    let aid = jsonBody.session.user.userId
    let usr = getUserByAmazonId(aid)
    if(usr !== null)
      io.to(usr._sid).emit('message', requestBody)
    //wait for response from client and send to Alexa
    setTimeout(() => {      
      if(alexaRes[aid]){
        res.statusCode = 200;
        res.contentType('application/json');
        res.send(alexaRes[aid]);
        delete alexaRes[aid]
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
        };
        res.statusCode = 200;
        res.contentType('application/json');
        res.send(responseBody);
      }
    }, 500)    
  })
})

//socket.io
io.on('connect', (socket) => {
    console.log('New client on socket is connected.')
/**
 * room: nazov kanala pre komunikaciu s klientmi;
 * amazonId: amazon ID;
 * passwd: prihlasovacie heslo - aktualne sa nepouziva;
 * callback: funkcia s jednym parametrom string pre spravu klientovi
 */
    socket.on('room', (room, amazonId, passwd, callback) => { 
      //loggin check
      db.collection('clients_table').findOne({name: amazonId}, (err, result) => {
        if(err)
          console.log(err)
        else{
          if(amazonId === result.name && passwd === result.password){

            if(isConnectedUser(amazonId)){
              user = getUserByAmazonId(amazonId)
              user._socket.disconnect()
              user._sid = socket.id
            }
            else{
              user = new User(amazonId, socket.id, socket)
            }
            socket.join(room)
            clients.push(user)
            console.log(clients)
            callback('yes')
          }
          else {
            callback('no')
            socket.disconnect()
          }
        }
      })
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
  for(user of clients){
    if(user._aid === amazonId){
      return user
    }
  }
  return null
}
function isConnectedUser(amazonId){
  for(user of clients){
    if(user._aid === amazonId){
      return true
    }
  }
  return false
}
})//end of db connection