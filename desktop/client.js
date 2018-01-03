//import { spawn } from 'child_process';

var http = require('http'),
    querystring = require('querystring')
    io = require('socket.io-client'),
    ks = require('node-key-sender'),
    finder = require('fs-finder'),
    exec = require('child_process').exec,
    os = process.platform,
    responseToAlexa = ""
    
socket = io('https://195d3fa9.ngrok.io')
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

/*
ks.sendCombination(['control', 'alt', 'delete'])
setInterval(()=>{
    ks.sendKey(['f5'])
    ks.sendKey(['right'])
}, 5000)
*/
//HTTP POST request
/*
var postData = querystring.stringify({
    msg: "give me JSON from Alexa!!\n"
})
var post_option = {
    host: 'e69818e1.ngrok.io',
    path: '/bordac6',
    method: 'POST'
}
var req = http.request(post_option, (res) => {
    res.setEncoding('utf8')
    res.on('data', (data) => {
        console.log('Respose: ' + data)
    })
    res.on('end', () => {
        console.log('No more data in response.')
    })
})

req.write(postData)
req.end()
*/
