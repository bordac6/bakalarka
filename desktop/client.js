//import { spawn } from 'child_process';

var querystring = require('querystring')
var io = require('socket.io-client')
var ks = require('node-key-sender')
var finder = require('fs-finder')
var exec = require('child_process').exec
var os = process.platform
let configName = 'config.json'
let user = {}
const afs = require('await-fs')
const fs = require('fs')
const serverURL = 'https://20789831.ngrok.io'

class Command{
    /**
     * 
     * @param {name of execution file} command 
     */
    constructor(command){
        this._command = require('./modules/'+command+'.js')
    }
    execute(){
        this._command.execute()
    }
}

(async function(){

   try{
       //saved login
       config = await afs.readFile(configName, 'utf8')
       console.log('saved: ', JSON.parse(config).email)
   }
   catch(err){
       //first start
       const promptly = require('promptly')
       const email = await promptly.prompt('Amazon email: ');
       console.log('creating file with email: ', email);
       config = {
           "email": email
       }
       fs.writeFile(configName, JSON.stringify(config), 'utf8', (err) =>{
           if(err) throw err;
           console.log('The file has been saved!')
       })
   }

socket = io(serverURL)
socket.on('connect', (err) => {
    user = JSON.parse(config)
    console.log('Meno: ', user['email']);
    if(err)
        console.log(err)
    else{
        console.log('is connected')
        if(user['email'] !== undefined){
            if(user['user_id'] === undefined){ //user_id is not yet saved
                var opn = require('opn')
                opn(serverURL+'/connect/amazon') //open login page
            }
            socket.emit('room', 'client', JSON.stringify(user), (msg) => {
                console.log('Message from server: ', msg)
            })
        }
        else {
            console.log('Bad file format. Email is not set.')
        }
    }
})

socket.on('message', (requestBody) => {
    //console.log('Incoming message:', requestBody)

    var jsonData = JSON.parse(requestBody)
    var type = jsonData.request.type
    //var command = require(b)

    craftResponse(type, jsonData)
    if(type === "IntentRequest"){
        var intentName = jsonData.request.intent.name
        command = new Command(intentName)
        command.execute()
        //executeCommand(jsonData)
    }
})
socket.on('login', (amazonUser) => {
    var au = JSON.parse(amazonUser)
    var mail = au['email']
    var user_id = au['user_id']
    if(mail !== undefined && user_id !== undefined)
        fs.writeFile(configName, amazonUser)

})
//socket.on('event', (data) => {})
socket.on('disconnect', (err) => {
  console.log('client was disconnected!', err)
})
})()

function response(msg){
    socket.emit('alexaRes', msg, (res) => {
        console.log('Recieved from server: '+res)
    })
}
function craftResponse(type, data){
    if(type === "LaunchRequest") {
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
    else if(type === "IntentRequest") {
      // crafting a response
      responseBody = {
        "version": "0.1",
        "response": {
          "outputSpeech": {
            "type": "PlainText",
            "text": "Do somethink on computer."
          },
          "card": {
            "type": "Simple",
            "title": "DoCommand",
            "content": "You sent command to Node.js client"
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
                "content": JSON.stringify(data)
              },
              "reprompt": {
                "outputSpeech": {
                  "type": "PlainText",
                  "text": "Say a command"
                }
              },
              "shouldEndSession": true
            }
        }
    }
    response(responseBody)
}
function executeCommand(jsonData){
        if(jsonData.request.intent.name == "NextSlideIntent"){
            ks.sendKey('right')
            response("should be here some JSON data")
        }
        else if(jsonData.request.intent.name == "OpenPresentationIntent"){
            var presentationName = jsonData.request.intent.slots.FileName.value + ".pptx"
            console.log(presentationName)
            var file = finder.from('').findFirst().findFiles(presentationName)
            console.log(file)
            if(file !== null){
                if(os == 'linux'){
                    exec('xdg-open ' + file, (err, out, code) => {
                        if(err) throw err
                    })
                }
                else if(os == 'win32'){ 
                    exec(file, (error, stdout, stderr) => {
                        if(error !== null){
                            console.log(`exec error: ${error}`)
                        }
                    })
                }
            }        
        }
        else if(jsonData.request.intent.name == "StartPresentationIntent"){
            ks.sendKey('f5')
        }
        else{
            response("Intent does not exist.")
        }
}