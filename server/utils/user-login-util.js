class User{
  constructor(amazonId=undefined, socketId=undefined, socket=undefined, email=undefined){
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
  addSocket(socket){
    if (this._socket)
      this._socket.disconnect()

    this._socket = socket
    this._sid = socket.id
  }
  addEmail(email){
    this._email = email
  }
}

let alexaRes = {}
let responseToAlexa = {}
let clients = []

exports.matchSocketConnectionWithAmazonAccount = function(usr, socket, room){
  const loginCredentials = JSON.parse(usr);
  const email = loginCredentials['email'];
  const token = loginCredentials['user_id'];

  const cachedUser = getUserByEmail(email);
  verifyToken(token, cachedUser);

  cachedUser.addEmail(email);
  cachedUser.addAmazonId(token);
  cachedUser.addSocket(socket);

  socket.join(room);
  clients.push(cachedUser);
  return 'Successfully connected on server.';
}

exports.removeUserFromCache = function(user){
  var index = clients.indexOf(user)
  if(index > -1) clients.splice(index, 1)
    console.log('Client disconnected.')
  console.log(clients)
}

exports.getUserBySocketId = function(socketId){
  for(user of clients){
    if(user._sid === socketId){
      return user
    }
  }
  return undefined
}

exports.getUserByAmazonId = function(amazonId){
  if(amazonId === null)
    return undefined
  for(user of clients){
    if(user._aid === amazonId){
      return user
    }
  }
  return undefined
}

exports.getUserByEmail = function(email){
  if(email === null)
    throw {message: "incorect credentials"};
  for(user of clients){
    if(user._email === email){
      return user;
    }
  }
  return new User();
}

function getUserByEmail(email){
  if(email === null)
    throw {message: "incorect credentials"};
  for(user of clients){
    if(user._email === email){
      return user;
    }
  }
  return new User();
}

exports.addUser = function(amazonUser){
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

function verifyToken(token, user) {
  if (user.aid !== undefined && token !== user.aid)
    throw {message: "Invalid credentials!"}
}