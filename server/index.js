const express = require('express'),
 app = express(),
 port = 7777,
 server = require('http').createServer(app)

app.post('/', (req, res) => {
    console.log("received echo request")
    var requestBody = ""

    req.on('data', (data) => {
        requestBody = data+".jpg"
    })

    req.on('end', () => {
        var responseBody = {requestBody}
        console.log(requestBody)
        console.log(JSON.stringify(requestBody))

        res.statusCode = 200
        res.contentType('application/json')
        res.send(responseBody)
    })
})

app.get('/', (request, response) => {
    response.send('Hello from Express! ')
})

app.listen(port, (err) => {
    if(err)
        return console.log('something bad happend', err)
    console.log(`server is listening on ${port}`)
}).once('error', (err) => {
    if (err.code == 'EADDRINUSE') {
        console.log(`port ${port} is alredy taken`)
        // app.close(() => {
        //     process.exit(0)
        // })
    }
})
