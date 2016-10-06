/**
 * Created by Raphael on 29/12/2015.
 */
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

let modelConnect = function(data, callback){
    let self = this;
    let _url = data.fullUrl;
	let _reconnect = data.reconnect;
    let reconnectCount = 0;
    (function connect(){
        reconnectCount++;
        if(reconnectCount > _reconnect.attempts) return console.error('Mongo failed to connect: ' + _url);
        console.error('Mongo trying to connect: ' + _url);
        MongoClient.connect(_url, function(err, db){
            if(err) {
                return setTimeout(connect, _reconnect.timeout);
            }else{
                console.error('Mongo connected: ' + _url);
                return callback(db);
            }
        });
    })();
};

module.exports = modelConnect;
