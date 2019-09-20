
export function createWebServer(server){
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
            "shouldEndSession": true
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
            console.log('request type: ', jsonBody.request.type)
            //get user by ID
            let usr = getUserByAmazonId(user_id)
            console.log('found client: ', usr)
            if(usr !== undefined){
              //send request from alexa to user`s socket
              io.to(usr._sid).emit('message', requestBody)

              // wait for response from client and send to Alexa
              setTimeout(() => {      
                if(alexaRes[user_id]){
                  res.statusCode = 200;
                  res.contentType('application/json');
                  res.send(alexaRes[user_id]);
                  delete alexaRes[user_id]
                }
              }, 600) 
            }
            else{
              console.log('User is not connected.')
              responseBody = {
                "version": "0.1",
                "response": {
                  "outputSpeech": {
                    "type": "PlainText",
                    "text": "Client is not connected."
                  },
                  "card": {
                    "type": "Simple",
                    "title": "DoCommand",
                    "content": "Can't connect to client."
                  },
                  "reprompt": {
                    "outputSpeech": {
                      "type": "PlainText",
                      "text": "Pleas connect your client app on your computer."
                    }
                  },
                  "shouldEndSession": false
                }
              }
              res.statusCode = 200;
              res.contentType('application/json');
              res.send(responseBody);
            }
          }
          else{
            console.log(error)
          }
        })
      }   
    })
  })
}