/**
 * Created by Raphael on 11/01/2016.
 */

let controller = require('./controller');

function DB(data, callback) {
	let dados = {};
	dados.name = data.name;
	dados.url = data.url;
	dados.fullUrl = data.url + data.name;
	controller(dados, function(db){
		dados.db = db;	
		callback(null, dados);
	});
}

module.exports = DB;