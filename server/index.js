var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var port = process.env.PORT || 3000
var alexaRes = ''
var responseToAlexa = {}
var clients = []

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

    // var jsonData = JSON.parse(requestBody)

    // if(jsonData.request.type == "LaunchRequest")
    // {
    //   // crafting a response
    //   responseBody = {
    //     "version": "0.1",
    //     "response": {
    //       "outputSpeech": {
    //         "type": "PlainText",
    //         "text": "Welcome to Echo Sample! Please say a command"
    //       },
    //       "card": {
    //         "type": "Simple",
    //         "title": "Opened",
    //         "content": "You started the Node.js Echo API Sample"
    //       },
    //       "reprompt": {
    //         "outputSpeech": {
    //           "type": "PlainText",
    //           "text": "Say a command"
    //         }
    //       },
    //       "shouldEndSession": false
    //     }
    //   };
    // }
    // else{
    //     responseBody = {
    //         "version": "0.1",
    //         "response": {
    //           "outputSpeech": {
    //             "type": "PlainText",
    //             "text": "Command sent to client."
    //           },
    //           "card": {
    //             "type": "Simple",
    //             "title": "Error Parsing",
    //             "content": JSON.stringify(requestBody)
    //           },
    //           "reprompt": {
    //             "outputSpeech": {
    //               "type": "PlainText",
    //               "text": "Say a command"
    //             }
    //           },
    //           "shouldEndSession": false
    //         }
    //     }
    // }
      setTimeout(() => {
        console.log("ALEXA RESPONSE 82: ", alexaRes)
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

    socket.on('room', (room, name, passwd, callback) => {
      console.log(name, ' ', passwd)
      if(name === 'name' && passwd === 'passwd'){
        socket.join(room)
        clients.push(socket.id)
        console.log(clients)
        callback('yes')
      }
      else 
        callback('no')
    })
    socket.on('disconnect', () => {
        var index = clients.indexOf(socket.id)
        if(index > -1) clients.splice(index, 1)
        console.log('Client disconnected.')
        console.log(clients)
    })
    socket.on('alexaRes', (req, res) => {
        alexaRes = req
        console.log("ALEXA RESPONSE 112: ", alexaRes)
        res("OK")
    })
})
//
