// Configurações do Multer
var multer = require('multer');
var publicPath = 'ads/'
var fullPath = 'public/' + publicPath;

// Configuração de armazenamento
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        console.log(JSON.stringify(file));
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
});
// Configuações do arquivo
var upload = multer({
    limits: {
        fileSize: 2 * 1024 * 1024 // Tamanho do arquivo em megas
    },
    storage: storage
});

module.exports = {multer: multer, storage: storage, upload: upload, paths : {public : publicPath, full: fullPath} };