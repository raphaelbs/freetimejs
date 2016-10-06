let async = require('async');
let assert = require('assert');
let databases;

/**
 * Inicializador das conexões com o banco de dados
 * @param  {Array}   asyncDatabases [Array com os modelos descritivos do banco de dados para o pool assincrono]
 * @param  {Function} callback       [Método de chamada quando todos pools estiverem abertos]
 */
let init = function(asyncDatabases, callback){
	async.parallel(asyncDatabases, function(err, results){
		if(err) return callback(err);
		databases = results;
		callback(null, results);
	});
};


/**
 * Disponibiliza operações CRUD para centralizar grande parte das personalizações com BD.
 * @type {Object}
 */
let crudOps = {
	insert : function(collection, data, callback){
		assert.notEqual(collection, undefined);
		assert.notEqual(data, undefined);
		assert.notEqual(callback, undefined);
		return collection.insertOne(data, {w : 1}, callback);
	},
	update : function(collection, filter, data, callback){
		assert.notEqual(collection, undefined);
		assert.notEqual(filter, undefined);
		assert.notEqual(data, undefined);
		assert.notEqual(callback, undefined);
		return collection.updateOne(filter, data, {w : 1}, callback);
	},
	select : function(collection, query, filters, callback){
		assert.notEqual(collection, undefined);
		assert.notEqual(query, undefined);
		if(callback === undefined && typeof filters === 'function')
			var callback = filters;
		let result = collection.find(query);
		if(typeof filters === 'object'){
			for(let key in filters){
				result = eval('result.' + key + '(' + filters[key] + ')');
			}
		}
		return result.toArray(callback);
	},
	delete : function(collection, filter, callback){
		assert.notEqual(collection, undefined);
		assert.notEqual(filter, undefined);
		assert.notEqual(callback, undefined);
		return collection.deleteOne(filter, {w : 1}, callback);
	},
	/**
	 * Busca banco de dados pelo nome. Mesmo nome descrito no modelo do banco de dados ('dbs.js').
	 * @param  {String} name [Nome do banco a ser pesquisado]
	 * @return {Mongo.DB}      [Instancia do banco de dados]
	 */
	get : function(name){
		if(name === undefined) return databases[0].db;
		for(let i=0; i < databases.length; i++){
			if(databases[i].name === name)
				return databases[i].db;
		}
		console.error('Não foi possível encontrar o DB requerido!');
		process.exit(1);
	}
}

module.exports = function(asyncDatabases, callback){
	init(asyncDatabases, callback);
	return crudOps;
};
