/**
 * Created by Raphael on 11/01/2016.
 */
exports.init = function(options, callback){
	exports.options = options;
	exports.Utils = require('./bin/utils');
	exports.Utils.searchHelpFolder(options.paths);

	exports.CRUD = require('./bin/CRUD/controller');
	exports.DB = require('./bin/db/dbs');
	exports.ObjectId = require('mongodb').ObjectID;
	exports.Router = require('./bin/CRUD/rest');
	exports.Multer = require('./bin/Multer/params');
	exports.DB.init(options.dbs, callback);
};
