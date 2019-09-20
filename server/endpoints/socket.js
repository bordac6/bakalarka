const getUserBySocketId = require("../utils/user-login-util").getUserBySocketId;
const matchSocketConnectionWithAmazonAccount = require("../utils/user-login-util").matchSocketConnectionWithAmazonAccount;
const removeUserFromCache = require("../utils/user-login-util").removeUserFromCache;

exports.createSocketServer = function(server) {
  let io = require('socket.io').listen(server);

  //socket.io
  io.on('connect', (socket) => {
    console.log('New client on socket is connected.')
  /**
  * room: name of chanel for communication with clients
  * usr : JSON login credentials
  * callback: function with one string for message to clien
  */
    socket.on('room', (room, usr, callback) => {
      
      try {
        const message = matchSocketConnectionWithAmazonAccount(usr, socket, room);
        callback(message);
      } catch (err) {
        socket.disconnect();
        console.log(err);
        callback(err);
      }
    })

    socket.on('disconnect', () => {
        var usr = getUserBySocketId(socket.id);
        removeUserFromCache(usr);
    })
    socket.on('alexaRes', (req, res) => {
      //check req is acceptable
        let usr = getUserBySocketId(socket.id)
        if(usr != undefined){
          alexaRes[usr._aid] = req
          res("Message was sent to Alexa skill.")
        }
        else{
          res("User is undefined.")
        }
    })
  })
}