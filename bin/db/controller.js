/**
 * Created by Raphael on 29/12/2015.
 */
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
let params = require('./params');

let modelConnect = function(data, callback){
    let self = this;
    let _url = data.fullUrl;
    let reconnectCount = 0;
    let connect = function(){
        reconnectCount++;
        if(reconnectCount > params.reconnect.attempts) return console.error('Mongo failed to connect: ' + _url);
        console.error('Mongo trying to connect: ' + _url);
        MongoClient.connect(_url, function(err, db){
            if(err) {
                return setTimeout(connect, params.reconnect.timeout);
            }else{
                console.error('Mongo connected: ' + _url);
                return callback(db);
            }
        });
    };
    connect();
};

module.exports = modelConnect;