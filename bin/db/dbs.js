let model = require('./model');
let params = require('./params');

let asyncDatabases = [
	function(callback){
		model({name: 'data', url : params.url}, callback);
	},
	function(callback){
		model({name: 'application', url : params.url}, callback);
	},
	function(callback){
		model({name: 'generated', url : params.url}, callback);
	},
	function(callback){
		model({name: 'files', url : params.url}, callback);
	},
	function(callback){
		model({name: 'rented', url : params.url}, callback);
	},
	function(callback){
		model({name: 'history', url : params.url}, callback);
	}
];

let crud = require('./crud');
let crudOps = {
	init : function(callback){
		let ncrud = crud(asyncDatabases, callback);
		for(let key in ncrud)
			crudOps[key] = ncrud[key];
	}
};
module.exports = crudOps;