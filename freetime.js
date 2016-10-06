/**
 * Created by Raphael on 11/01/2016.
 */
exports.CRUD = require('./bin/CRUD/controller');
exports.DB = require('./bin/db/dbs');
exports.Utils = require('./bin/utils');
exports.ObjectId = require('mongodb').ObjectID;
exports.Router = require('./bin/CRUD/rest');
exports.Multer = require('./bin/Multer/params');
exports.Server = require('./bin/server/params');