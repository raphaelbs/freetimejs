let model = require('./model');

let asyncDatabases = [];
function insertDb(db){
	asyncDatabases.push(
		function(callback){
			model(db, callback); //name, url
		}
	);
}

function sortDatabases(databases){
	databases.forEach(function(db){
		insertDb(db);
	});
	return asyncDatabases;
}

let crudOps = {
	init : function(databases, callback){
		let ncrud = require('./crud')(sortDatabases(databases), callback);
		for(let key in ncrud)
			crudOps[key] = ncrud[key];
	}
};
module.exports = crudOps;
