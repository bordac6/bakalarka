//import { spawn } from 'child_process';

var querystring = require('querystring')
var io = require('socket.io-client')
var ks = require('node-key-sender')
var finder = require('fs-finder')
var exec = require('child_process').exec
var os = process.platform
 
socket = io('https://92d36cb9.ngrok.io')
socket.on('connect', (err) => {
    if(err)
        console.log(err)
    else{
        console.log('is connected')
        
        var opn = require('opn')
        opn('https://92d36cb9.ngrok.io/connect/amazon') //open login page

        var name = 'bordac6@uniba.sk' //get name from file or some input from client
        socket.emit('room', 'client', name, (msg) => {
            console.log('Message from server: ', msg)
        })
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
        console.log('execute command: ', intentName)
        executeCommand(jsonData)
    }
})
//socket.on('event', (data) => {})
socket.on('disconnect', (err) => {
  console.log('client was disconnected!', err)
})

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