import { getUserByAmazonId, getUserByEmail, getUserBySocketId } from "../utils/user-login-util";
import { isConnectedUser, isLoggedIn } from "../utils/user-login-util";
import { matchSocketConnectionWithAmazonAccount } from "../utils/user-login-util";

export function createSocketServer(server) {
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
        matchSocketConnectionWithAmazonAccount(usr, socket, room, callback);
      } catch (err) {
        callback(err);
        socket.disconnect();
      }
      //loggin check
      // au = JSON.parse(usr)
      // if(au !== null) {
      //   email = au['email']
      //   aid = au['user_id']
      //   if(isLoggedIn(email)){
      //     user = getUserByEmail(email)
      //     if(isConnectedUser(email)){ //connection second time
      //       user._socket.disconnect()
      //     }
      //     user.addSocketId(socket.id)
      //     user.addSocket(socket)
      //     if(aid !== null){
      //       user.addAmazonId(aid)
      //     }
      //     socket.join(room)
      //     clients.push(user)
      //     callback('Previous client was disconnected. You are now controling this computer.')
      //   }
      //   else{
      //     user = getUserByEmail(email)
      //     if(user === undefined){ //shoul`d be here in first time
      //       var msg = 'Wait for amazon loggin.'
      //       user = new User()
      //       user.addEmail(email)
      //       if(aid !== null){
      //         user.addAmazonId(aid)
      //         msg = 'Succesfully logged in.'
      //       }
      //       user.addSocket(socket)
      //       user.addSocketId(socket.id)

      //       socket.join(room)
      //       clients.push(user)
      //       callback(msg)
      //     }
      //     else{ 
      //       callback('Not yet logged with amazon.')
      //       socket.disconnect()
      //     }
      //   }
      //   console.log(clients.length, ' users are connected.')
      // }
      // else{
      //   console.log('undefined clien try connect')
      //   callback('undefined user')
      // }

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