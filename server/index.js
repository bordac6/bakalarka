var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    port = process.env.PORT || 3000,
    alexaReq = "",
    alexaRes = {},
    io = require('socket.io').listen(server)

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
    alexaReq = requestBody
    
    var jsonData = JSON.parse(alexaReq)

    if(jsonData.request.type == "LaunchRequest")
    {
      // crafting a response
      responseBody = {
        "version": "0.1",
        "response": {
          "outputSpeech": {
            "type": "PlainText",
            "text": "Welcome to Echo Sample! Please say a command"
          },
          "card": {
            "type": "Simple",
            "title": "Opened",
            "content": "You started the Node.js Echo API Sample"
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
    }
    else{
        responseBody = {
            "version": "0.1",
            "response": {
              "outputSpeech": {
                "type": "PlainText",
                "text": "Command sent to client."
              },
              "card": {
                "type": "Simple",
                "title": "Error Parsing",
                "content": JSON.stringify(requestBody)
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
    
    res.statusCode = 200;
    res.contentType('application/json');
    res.send(responseBody);

  })
})

//socket.io
io.on('connect', (socket) => {
    console.log('New client on socket is connected.')
    
    socket.on('disconnect', () => {
        console.log('Client disconnected.')
    })

    socket.on('task', (msg, req) => {
        if(alexaReq != "") 
            req(alexaReq)
        alexaReq = ""
    })

    socket.on('alexaRes', (req, res) => {
        alexaRes = req
        res("OK")
    })
})
//
