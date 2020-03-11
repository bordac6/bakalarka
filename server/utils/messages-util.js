var request = require('request');

exports.sendRequestToClientBySocket = (requestBody) => {
  
  let jsonBody = JSON.parse(requestBody)
  let aid = jsonBody.session.user.accessToken
  
  if(!aid){
    throw userNotAuthenticated();
  }
  else {
    let amznProfileURL = 'https://api.amazon.com/user/profile?access_token='
    amznProfileURL += aid
    request(amznProfileURL, function(error, response, body){
      if(response.statusCode == 200){
        let profile = JSON.parse(body)
        let user_id = profile.user_id
        console.log('userID: ', user_id)
        console.log('request type: ', jsonBody.request.type)
        //get user by ID
        let usr = getUserByAmazonId(user_id)
        console.log('found client: ', usr)
        if(usr !== undefined){
          //send request from alexa to user`s socket
          io.to(usr._sid).emit('message', requestBody)

        }
        else{
          console.log('User is not connected.')
          throw userNotConnectedError();
        }
      }
      else{
        console.log(error)
        throw error;
      }
    })
  }
}

function userNotConnectedError(){
  return {
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
}

function userNotAuthenticated() {
  return {
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
}