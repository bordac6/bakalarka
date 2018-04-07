//import { spawn } from 'child_process';

var querystring = require('querystring');
var io = require('socket.io-client');
var stringCommands = {};
var nrc = require('node-run-cmd');
let commandsPath = 'commands.json';
let configName = 'config.json';
let user = {};
const afs = require('await-fs');
const fs = require('fs');
const serverURL = 'https://4baa4c89.ngrok.io';

class Command{
    /**
     * 
     * @param {name of execution file} command 
     */
    constructor(command, jData){
        this._command = require('./intents_modules/default/'+command)
        this._jData = jData
    }
    execute(){
        this._command.execute(this._jData)
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
       cfg = {
           "email": email
       }
       config = JSON.stringify(cfg)
       fs.writeFile(configName, config, 'utf8', (err) =>{
           if(err) throw err;
           console.log('The file has been saved!')
       })
   }
   try{
        cmds = await afs.readFile(commandsPath, 'utf8')
        stringCommands = JSON.parse(cmds)
   }
   catch(err){
        console.log('You dont have commands JSON file.')
   }

socket = io(serverURL)
socket.on('connect', (err) => {
    user = JSON.parse(config)
    console.log('Meno: ', user['name']);
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
                console.log('Log-in Message from server: ', msg)
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
    if(type === "IntentRequest"){
        var intentName = jsonData.request.intent.name

        if(stringCommands !== {} && stringCommands[intentName] !== undefined){ //defined command in json file
            var cmd = stringCommands[intentName]
            console.log('Commad to execute: ', cmd)

            //ban dangerous commands
            if(!cmd.match("(\^rm)|(\^del)")){ 
                console.log("Do somethink save")
                nrc.run(cmd);
            }
            else {
                console.log('can`t remove files!')
            }
        }
        else{
            //if exist customCommand in ./CustomIntents/type.js
            //else execute ./DefaultIntents/type.js
            command = new Command(intentName, jsonData)
            command.execute()
        } 
    }
    craftResponse(type, jsonData)
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