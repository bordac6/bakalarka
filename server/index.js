var assert = require('assert')
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var port = process.env.PORT || 3000
var alexaRes = ''
var responseToAlexa = {}
var clients = []

//comunicate with database
    //add new client
    // var obj = {
    //   id : "0",
    //   name : "test",
    //   password : "passwd",
    //   socketID : "aaZZ"
    // }
    // collection.insertOne(obj, (err, res) => {
    //   if(err) 
    //     console.log('Unable insert client')
    //   else {
    //     console.log("client inserted")
    //     db.close()
    //   }
    // })

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
    io.to(clients[0]).emit('message', requestBody)
    //wait for response from client and send to Alexa
    setTimeout(() => {
      console.log("ALEXA RESPONSE 31: ", alexaRes)
      res.statusCode = 200;
      res.contentType('application/json');
      res.send(alexaRes);
      alexaRes = '';
    }, 500)    
  })
})

//socket.io
io.on('connect', (socket) => {
    console.log('New client on socket is connected.')
/**
 * room: nazov kanala pre komunikaciu s klientmi;
 * LoginName: prihlasovacie meno;
 * passwd: prihlasovacie heslo zasifrovane;
 * callback: funkcia s jednym parametrom string pre spravu klientovi
 */
    socket.on('room', (room, LoginName, passwd, callback) => { 
      console.log(LoginName, ' ', passwd)
      //loggin check
      db.collection('clients_table').findOne({name: LoginName}, (err, result) => {
        if(err)
          console.log(err)
        else{
          console.log(result.name, ' ', result.password)
          if(LoginName === result.name && passwd === result.password){
            //ak je pouzivatel ma jeden socket, ten treba vyhodit a miesto neho dat novy
            var user = {
              "name" : LoginName,
              "socketID" : socket.id
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
        var index = clients.indexOf(socket.id)
        if(index > -1) clients.splice(index, 1)
        console.log('Client disconnected.')
        console.log(clients)
    })
    socket.on('alexaRes', (req, res) => {
      //check req is acceptable
        alexaRes = req
        console.log("ALEXA RESPONSE 65: ", alexaRes)
        res("OK")
    })
})

})//end of db connection