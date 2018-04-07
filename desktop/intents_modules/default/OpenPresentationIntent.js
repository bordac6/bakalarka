var finder = require('fs-finder');
var os = process.platform;
var exec = require('child_process').exec;

module.exports = {
    execute: function(jsonData){
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
}