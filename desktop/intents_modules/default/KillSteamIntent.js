var nrc = require('node-run-cmd');
module.exports = {
    execute: function(jsonData){
        var stringCommand = "taskkill /FI "IMAGENAME eq steam*" /F
        nrc.run(stringCommand)
    }
}
