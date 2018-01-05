//import { spawn } from 'child_process';

var http = require('http'),
    querystring = require('querystring')
    io = require('socket.io-client'),
    ks = require('node-key-sender'),
    finder = require('fs-finder'),
    exec = require('child_process').exec,
    os = process.platform,
    responseToAlexa = ""
    
socket = io('https://2992d795.ngrok.io')
socket.on('connect', () => {
    console.log('is connected')
})
socket.on('event', (data) => {})
socket.on('disconnect', () => {})

setInterval(() => {
    socket.emit('task', 'bordac6', (res) => {
        //console.log(`Recieve:\n${res}`)
        if(res != ""){
            
            var jsonData = JSON.parse(res);
            if(jsonData.request.type == "IntentRequest"){
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
        }
    })
}, 3000)

function response(msg){
    socket.emit('alexaRes', msg, (res) => {
        console.log('Recieved from server: '+res)
    })
}
