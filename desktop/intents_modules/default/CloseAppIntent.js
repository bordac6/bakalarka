var ks = require('node-key-sender');
module.exports = {
    execute: function(jsonData){
        ks.sendCombination(['alt', 'f4'])
    }
}