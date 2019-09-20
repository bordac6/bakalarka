class User{
  constructor(amazonId=null, socketId=null, socket=null, email=null){
    this._email = email
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
  get email(){
    return this._email
  }
  addAmazonId(amazonId){
    this._aid = amazonId
  }
  addSocketId(socketId){
    this._sid = socketId
  }
  addSocket(socket){
    this._socket = socket
  }
  addEmail(email){
    this._email = email
  }
}

let alexaRes = {}
let responseToAlexa = {}
let clients = []

export function matchSocketConnectionWithAmazonAccount(usr, socket, room, callback){
  const userLoginObject = JSON.parse(usr);
  if (userLoginObject === null) {
    throw {message: "Requested login is incorrect."}
  }
  const email = userLoginObject['email'];
  const amazonId = userLoginObject['user_id'];
  if (isLoggedIn(email)){
    addSocketToUser()
    user = getUserByEmail(email);
    if (isConnectedUser(email)) {
      user._socket.disconnect();
    }
    user.addSocketId(socket.id);
    user.addSocket(socket);
    if (amazonId !== null) {
      user.addAmazonId(amazonId);
    }

  }
  
}

export function getUserBySocketId(socketId){
  for(user of clients){
    if(user._sid === socketId){
      return user
    }
  }
  return undefined
}

export function getUserByAmazonId(amazonId){
  if(amazonId === null)
    return undefined
  for(user of clients){
    if(user._aid === amazonId){
      return user
    }
  }
  return undefined
}

export function getUserByEmail(email){
  if(email === null)
    return undefined
  for(user of clients){
    if(user._email === email){
      return user
    }
  }
  return undefined
}

export function isConnectedUser(email){
  if(email === null)
    return false
  for(user of clients){
    if(user._email === email && user._aid !== null && user._sid !== null){
      return true
    }
  }
  return false
}

export function isLoggedIn(email){
  if(email === null)
    throw false
  for(user of clients){
    if(user._email === email && user._aid !== null){
      return true
    }
  }
  return false
}

export function addUser(amazonUser){
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
