const sendDataToClientBySocket = require('../utils/messages-util.js').sendRequestToClientBySocket;

let alexaRes = {};

exports.createWebServer = function(app, server, port){
  // Creates the website server on the port #
  server.listen(port, function () {
    console.log('Server listening at port %d', port);
  });

  // Handles the route for echo apis
  app.post('/api/echo', function(req, res){
    console.log("received echo request");
    let requestBody = "";
    // Will accumulate the data
    req.on('data', function(data){
      requestBody+=data;
    });

    // Called when all data has been accumulated
    req.on('end', function(){

      try {
        sendDataToClientBySocket(requestBody);

        // wait for response from client and send to Alexa
        setTimeout(() => {
          if(alexaRes[user_id]){
            res.statusCode = 200;
            res.contentType('application/json');
            res.send(alexaRes[user_id]);
            delete alexaRes[user_id]
          }
        }, 600);
      } catch (err) {
        res.statusCode = 200;
        res.contentType('application/json');
        res.send(err);
      }
    })
  })
}

exports.prepareClientResponse = (userAmazonID, response) => {
  alexaRes[userAmazonID] = response;
}