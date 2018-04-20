//import { spawn } from 'child_process';

var querystring = require('querystring');
var io = require('socket.io-client');
var stringCommands = {};
var nrc = require('node-run-cmd');
var path = require('path');
var os = require('os');
var custom = path.join(os.homedir(), 'AlexaComputerControl', 'custom');
var stringCommands = {};
let commandsPath = 'commands.json';
let configName = 'config.json';
let loginConfigPath = path.join(os.homedir(), 'AlexaComputerControl', configName);
let commandConfigPath = path.join(os.homedir(), 'AlexaComputerControl', commandsPath);
let user = {};
const afs = require('await-fs');
const fs = require('fs');
const serverURL = 'https://4baa4c89.ngrok.io';

class Command{
    /**
     * 
     * @param {name of execution file} command 
     * @param {json data from alexa skill} jData 
     */
    constructor(command, jData){

        try{
            this._command = require(path.join(custom, command))
        }
        catch (err){
            try{
                this._command = require(path.join(__dirname, 'intents_modules', 'default', command))
            }
            catch (err){
                console.log("Intent is no defined.")
                console.log(path.join(custom,command))
            }
        }
        this._jData = jData
    }
    execute(){
        this._command.execute(this._jData)
    }
}
(async function(){
//input from electron app
process.on('message', (msg)=>{
    console.log("Message from partent: ", msg);
    if(msg === 'reload commands'){
        loadCommands();
        console.log("CLIENT: ", stringCommands)
    }
})
try{
    process.send("client started")
}
catch (err){
    console.log("I am master.")
}
process.on('exit', (code) => {
    process.exit(0);
})

//console app


    if(!fs.existsSync(path.join(os.homedir(), 'AlexaComputerControl'))){
        fs.mkdir(path.join(os.homedir(), 'AlexaComputerControl'))
        console.log("makeing app directory")
    }
    if(!fs.existsSync(custom)){
        fs.mkdir(custom)
        console.log("makeing app directory")
    }
    try{
        fs.readFileSync(commandConfigPath)
    }
    catch(err){
        var item = {"TypeIntent":"bash/cmd command"}
        var commandsFile = JSON.stringify(item)
        fs.writeFile(commandConfigPath, commandsFile, 'utf8', (err) =>{
            if(err) throw err;
        })
        console.log("makeing configuration file")
    }
    try{
        //saved login
        config = await afs.readFile(loginConfigPath, 'utf8')
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
        fs.writeFile(loginConfigPath, config, 'utf8', (err) =>{
            if(err) throw err;
            console.log('The file has been saved!')
        })
    }
    try{
        cmds = await afs.readFile(commandConfigPath, 'utf8')
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
        console.log(intentName)
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
        fs.writeFile(loginConfigPath, amazonUser)

})
//socket.on('event', (data) => {})
socket.on('disconnect', (err) => {
  console.log('client was disconnected!', err)
  process.send('disconnected')

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

function loadCommands(){
    try{
        cmds = fs.readFileSync(commandConfigPath)
        stringCommands = JSON.parse(cmds)
    }
    catch(err){
        console.log('You dont have commands JSON file.')
    }
}