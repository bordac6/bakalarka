//import { spawn } from 'child_process';

var http = require('http')
var querystring = require('querystring')
var io = require('socket.io-client')
var ks = require('node-key-sender')
var finder = require('fs-finder')
var exec = require('child_process').exec
var os = process.platform
var responseToAlexa = ""
    
socket = io('https://65fd70f2.ngrok.io')
socket.on('connect', () => {
    console.log('is connected')
    socket.emit('room', 'test', 'name', 'passwd', (msg) => {
        console.log('is connected? -', msg)
    })
})
socket.on('message', (requestBody) => {
    //console.log('Incoming message:', requestBody)

    var jsonData = JSON.parse(requestBody)
    var type = jsonData.request.type

    craftResponse(type, jsonData)
    if(type === "IntentRequest")
        executeCommand(jsonData)
    
   
})
socket.on('event', (data) => {})
socket.on('disconnect', () => {})

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
                        ks.sendKey('f5')
                        if(err) throw err
                    })
                }
                else if(os == 'win32'){ 
                    exec(file, (error, stdout, stderr) => {
                        ks.sendKey('f5')
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