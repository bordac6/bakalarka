var http = require('http'),
    querystring = require('querystring')
    io = require('socket.io-client'),
    ks = require('node-key-sender'),
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
                    ks.sendKey(['right'])
                    response("should be here some JSON data")
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