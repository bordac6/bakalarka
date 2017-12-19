var http = require('http'),
    querystring = require('querystring')

var postData = querystring.stringify({
    msg: "hello world",
    home: "Vistuk"
})
var post_option = {
    host: 'localhost',
    port: '7777',
    path: '/',
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