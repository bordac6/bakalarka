var ks = require('node-key-sender');
module.exports = {
    execute: function(jsonData){
        ks.sendKey('v')
    }
}