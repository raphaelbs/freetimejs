let freetimejs = require('../freetime');
let fs = require('fs');
let path = require('path');
let assert = require('assert');

function loader(app) {
    app.use(freetimejs.Utils.allowCrossDomain);

	if(!freetimejs.options.paths) return app;
	if(!freetimejs.options.paths.routes) return app;
	let myroutes = freetimejs.options.paths.routes;

	console.error('<Links da API>');
    // PAGES
    // Inclui os arquivos encontrados em 'freetimejs.options.paths.routes.pages'
    // no índice de rotas com base no nome dos arquivos, sem incluir prefixo.
    if(myroutes.pages){
		let pageFiles = fs.readdirSync(myroutes.pages);
		console.error('**criando rotas para páginas**')
		pageFiles.forEach(function(page){
			page = page.split('.')[0];
	        if (page === 'index')
	            page = '';
			let mypath = path.join(myroutes.pages, page);
			console.error(' →\t/' + page + '\t\t\t→\t' + mypath);
	        app.use('/' + page, require(mypath));
		});
	}


	// REST LOADERS
	// Inclui os arquivos encontrados em 'freetimejs.options.paths.routes.dynamic'
	// no índice de rotas com base no nome dos arquivos, incluindo o prefixo.
	if(myroutes.dynamic){
	    let dynamicGen = fs.readdirSync(myroutes.dynamic);
	    console.error('**criando rotas para dados sem modelo (dinamicamente gerado)**');
		dynamicGen.forEach(function(file){
			let filename = file.split('.')[0];
	        let link = (myroutes.prefix || '/api/') + filename;
			let mypath = path.join(myroutes.dynamic, filename);
			console.error(' →\t' + link + '\t\t\t→\t' + mypath);
	        app.use(link, require(mypath));
		});
	}


    // MODEL LOADERS
    // Carrega os modelos como rotas REST incluindo suas rotas físicas se houver
    if(freetimejs.options.paths.models){
	    let modelFiles = fs.readdirSync(freetimejs.options.paths.models);
		modelFiles.forEach(function(modelFileName){
			modelFileName = modelFileName.split('.')[0];
			let modelObject = require(path.join(freetimejs.options.paths.models, modelFileName));

			// nome do modelo (string)
	        assert.notEqual(modelObject.name, undefined);
			// link rest
			assert.notEqual(modelObject.link, undefined);
			// database do modelo (string)
			assert.notEqual(modelObject.database, undefined);
			// coleção do modelo (string)
			assert.notEqual(modelObject.collection, undefined);
			// mostrar log (true ou false)
	        assert.notEqual(modelObject.log, undefined);
			// apenas igual o modelo (true ou false)
	        assert.notEqual(modelObject.strict, undefined);
			// conteudo e descrição do modelo
	        assert.notEqual(modelObject.content, undefined);

	        let link = (myroutes.prefix || '/api/') + modelObject.link;

	        // Se houver uma extensão REST do modelo
	        if (modelObject.physicalRest) {
	            // Use a extensão do REST
	            let mypath = path.join(myroutes.physicalRest, modelObject.physicalRest);
				console.error(' →(RF)\t' + link + '\t\t\t→\t' + mypath);
	            app.use(link, require(mypath));
	        } else {
	            // Caso contrário, crie um REST genérico
	            console.error(' →(RG)\t' + link + '\t\t\t→\t modelo: ' + modelObject.name);
	            app.use(link, new freetimejs.Router(modelObject));
	        }
		});
	}

    return app;
}

module.exports = loader;
