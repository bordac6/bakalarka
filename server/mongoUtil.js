var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/clients'
var _db

module.exports = {
    connectToServer: function( callback ){
        MongoClient.connect(url, (err, db) => {
            _db = db
            return callback(err)
        })
    },
    getDb: function(){
        return _db
    }
}