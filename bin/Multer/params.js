// Configurações do Multer
var multer = require('multer');
var freetimejs = require('../../freetime').options;

// Configuração de armazenamento
freetimejs.multer.file['storage'] = multer.diskStorage(freetimejs.multer.storage);


module.exports = {
	multer: multer,
	storage: freetimejs.multer.file['storage'],
	upload: multer(freetimejs.multer.file), // Configuações do arquivo
	paths : {
		public : freetimejs.multer.public,
		full: freetimejs.multer.full
	}
};
