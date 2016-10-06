/**
 * Created by Raphael on 11/01/2016.
 */

let controller = require('./controller');

function DB(data, callback) {
	data.fullUrl = data.url + data.name;
	controller(data, function(db){
		data.db = db;
		callback(null, data);
	});
}

module.exports = DB;
