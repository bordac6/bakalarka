var nrc = require('node-run-cmd');
//need installed nircmd on Windows. This is not posible for UNIX systems
module.exports = {
    execute: function(jsonData){
        var number = jsonData.request.intent.slots.number.value
        var stringCommand = "D:\\FMFI\\BakalarskaPraca\\LS\\nircmd\\nircmd.exe changesysvolume -" + 2000*number
        console.log(number)
        nrc.run(stringCommand)
    }
}