/**
 * Created by Raphael on 09/01/2016.
 */

 // TODO: primeira modificação para adequação ao 'const' & 'let'
const ObjectId = require('mongodb').ObjectID;
const assert = require('assert');

function CRUDOperations(collection) {
    assert.notEqual(collection, undefined);
    let _collection = collection;

    // Adiciona
    this.add = function add_CRUDop(insertObject, callback) {
        assert.notEqual(insertObject, undefined);
        assert.notEqual(callback, undefined);
        log('add', JSON.stringify(insertObject));
        _collection.insertOne(insertObject, {w: 1}, function insertOne_CRUDop(err, doc) {
            if (err) return callback(err);
            return callback(null, doc.ops[0]);
        });
    };

    // Adiciona múltiplos
    this.adds = function add_CRUDop(insertObjects, callback) {
        assert.notEqual(insertObjects, undefined);
        assert.notEqual(callback, undefined);
        log('adds', insertObjects);
        _collection.insertMany(insertObjects, {w: 1}, function insertOne_CRUDop(err, doc) {
            if (err) return callback(err);
            return callback(null, doc.ops);
        });
    };

    // Busca única
    this.get = function get_CRUDop(_id, callback) {
        assert.notEqual(_id, undefined);
        assert.notEqual(callback, undefined);
        log('get', _id);
        _collection.find({"_id": ObjectId(_id)}).toArray(callback);
    };

    // Busca por userId
    this.userId = function userId_CRUDop(userId, callback) {
        assert.notEqual(userId, undefined);
        assert.notEqual(callback, undefined);
        log('userId', JSON.stringify(userId));
        _collection.find({userId: userId}).toArray(callback);
    };

    // Busca completa
    this.gets = function gets_CRUDop(callback) {
        assert.notEqual(callback, undefined);
        log('gets', '');
        _collection.find().toArray(callback);
    };

    // Atualiza
    this.update = function update_CRUDop(_id, updateOP, callback) {
        assert.notEqual(_id, undefined);
        assert.notEqual(updateOP, undefined);
        assert.notEqual(callback, undefined);
        log('update', _id + ' with ' + JSON.stringify(updateOP));
        _collection.updateOne({_id: ObjectId(_id)}, updateOP, {w: 1}, callback);
    };

    // Deleta
    this.delete = function delete_CRUDop(_id, callback) {
        assert.notEqual(_id, undefined);
        assert.notEqual(callback, undefined);
        log('delete', _id);
        _collection.deleteOne({"_id": ObjectId(_id)}, {w: 1}, callback);
    };
};

function log(op, msg) {
    console.log('[FREETIME:controller:' + op + ']' + msg);
}

module.exports = CRUDOperations;