/**
 * Created by Raphael on 05/01/2016.
 */
var fs = require('fs');
var path = require('path');
var FreeTime = require('../freetime');

/**
 * Retorna apenas o nome do host (sem protocolo)
 * @param req - requisição http/https
 * @returns {*} - somente host
 */
exports.host = function host_Utils(req) {
    return req.headers.host.match(/[^:]+/g)[0];
};

/**
 * Retorna o nome do host com protocolo de acordo com a porta
 * @param req - requisição http/https
 * @returns {string} - host completo
 */
exports.completehost = function completehost_Utils(req) {
    return (req.secure ? 'https://' : 'http://') + req.headers.host;
};

/**
 * Permite Cross Domain Calls mas limita às chamadas vindas de dentro do servidor (em diferentes portas)
 * @param req - requisição
 * @param res - response
 */
exports.allowCrossDomain = function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', (req.secure ? 'https://' : 'http://') + (FreeTime.Server.allowCrossDomain.url || exports.host(req)) + ':' + FreeTime.Server.allowCrossDomain.getPort(req.secure)); // TODO : posteriormente deixar apenas FreeTime.Server.allowCrossDomain.url
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);
    next();
};

/**
 * Retorna o conteudo da pasta de ajuda (para complementar o menu de ajuda automaticamente)
 * @returns {[]} - Array contendo nomes dos arquivos.
 */
exports.searchHelpFolder = (function searchHelpFolder_Utils() {
    console.error('Gerando links de ajuda..');
    console.error('**com modelo**');
    var genHelps = [];
    var help = fs.readdirSync(path.join(__dirname, '..', '..', 'models'));
    for (var i = 0; i < help.length; i++) {
        var fileName = help[i];
        console.error('→' + fileName);
        var fileObj = require(path.join(__dirname, '..', '..', 'models', fileName));
        genHelps.push({name: fileObj.name, link: fileObj.link});
    }

    console.error('**sem modelo**');
    var wmodel = fs.readdirSync(path.join(__dirname, '..', '..', 'data', 'jsons', 'wmodel'));
    for (var i = 0; i < wmodel.length; i++) {
        var m = wmodel[i].split('.')[0];
        console.error('→' + m);
        genHelps.push({name: m, link: m});
    }
    return genHelps;
})();

/**
 * Retorna um objeto JSON contendo informações comuns à todas páginas que devem ser renderizadas.
 * @param req - requisição http/https
 * @returns {host: *, completehost: *, helpFolder : *}
 */
exports.getDefaultRenderContent = function getDefaultRenderContent_Utils(req) {
    return {
        host: exports.host(req),
        completehost: exports.completehost(req),
        helpFolder: exports.searchHelpFolder,
        httpport: FreeTime.Server.thisServer.http,
        httpsport: FreeTime.Server.thisServer.https
    };
};

// Comum - Retorna distância entre dois pontos terrestres
var distanceFrom2Points = function (pos1, pos2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(pos1.lat - pos2.lat);
    var dLon = deg2rad(pos1.lng - pos2.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(pos1.lat)) * Math.cos(deg2rad(pos2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
};
// Comum - Transforma graus em radianos
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Mensagens padrões do método de conferência.
exports.ConferenceMSGS =
{
    BODY_INCOMPLETE: 'MODEL requer mais parâmetros dos que foram enviados no BODY',
    STRICT_INCORRECT: 'MODEL definido como STRICT porém existem dados adicionais no BODY',
    NOT_CHECK: 'BODY não contem os mesmos parâmetros requisitados no MODEL',
    DEFAULTS_MISSING: 'MODEL contém parâmetro REQUIRED porém não contém as definições DEFAULTS. Informe a função para criar o modelo padrão dos campos requeridos em REQUIRED.',
    DEFAULTS_INCOMPLETE: 'MODEL contém parâmetro REQUIRED porém as definições DEFAULTS estão incompletas. As definições DEFAULTS devem ter as mesmas chaves que as definições CONTENT.'
};

// Confere MODEL e BODY
exports.Conference = function (model, body, callback) {
    var bodyKeys = Object.keys(body);

    // Compara os membros de dois objetos
    function compareObjects(obj1Keys, obj2Keys) {
        var iterateObj2 = function (obj1Key) {
            for (var i = 0; i < obj2Keys.length; i++) {
                if (obj2Keys[i] === obj1Key) {
                    return true;
                }
            }
            return false;
        };
        var iterateObj1 = function () {
            for (var i = 0; i < obj1Keys.length; i++) {
                if (!iterateObj2(obj1Keys[i]))
                    return false;
            }
            return true;
        };
        return iterateObj1();
    }

    // Escolhe qual modelKeys será usado com base no Modelo definido
    function chooseModelKeys() {
        if (model.required) {
            if (!model.defaults) return callback(exports.ConferenceMSGS.DEFAULTS_MISSING);
            return Object.keys(model.required);
        } else
            return Object.keys(model.content);
    }

    var check = function () {
        var modelKeys = chooseModelKeys();
        if (!model.allowNull && modelKeys.length > bodyKeys.length) return callback(exports.ConferenceMSGS.BODY_INCOMPLETE, 'INFORME:\n' + modelKeys);
        if (model.strict && modelKeys.length < bodyKeys.length)
            return callback(exports.ConferenceMSGS.STRICT_INCORRECT, 'INFORME:\n' + modelKeys);
        if (!compareObjects(bodyKeys, modelKeys)) return callback(exports.ConferenceMSGS.NOT_CHECK, 'INFORME:\n' + modelKeys);
        if (model.required) return callback(null, new model.defaults(body));
        return callback(null, body);
    };
    check();
};
/**
 * Log de resposta para inserção múltipla
 * @param max
 * @param callback
 */
exports.MultipleInsertLog = function resLog(max, callback) {
    var log = {inserted: 0, wrong: 0, error: 0};
    this.addIns = function () {
        log.inserted++;
        exec();
    };
    this.addWrong = function () {
        log.wrong++;
        exec();
    };
    this.addError = function () {
        log.error++;
        exec();
    };
    var exec = function () {
        if (log.error + log.inserted + log.wrong == max) {
            callback(log);
        }
    }
};

/**
 * Cria um bloco de execução delimitado por um tempo.
 * Ao chamar o método 'check', é feita conferencia e se o tempo tiver ultrapassado
 * o limite 'time', a função 'done' é invocada. Opcionalmente, é possível chamar
 * a função 'waiting' que representa o estado em que o tempo ainda não ultrapassou o limite.
 * @param time - tempo limite, em milisegundos
 * @param done - função que executa se o tempo ultrapassou o limite
 * @param waiting - função que executa se o tempo não ultrapassou o limite
 * @constructor
 */
exports.TimerBlock = function (time, done, waiting) {
    var current = 0;
    var log = false;
    this.check = function () {
        var nn = new Date();
        if (nn - current > time) {
            current = nn;
            if (log) console.log('[FREETIMEJS:TimerBlock] -> done');
            return done(nn);
        } else {
            if (log) console.log('[FREETIMEJS:TimerBlock] -> waiting');
            if (waiting) return waiting(nn);
        }
    };
    this.setLog = function (bool) {
        log = bool;
    };
    this.setDone = function (fndone) {
        done = fndone;
    };
    this.setWaiting = function (fnwaiting) {
        waiting = fnwaiting
    };
    this.setTime = function (ntime) {
        time = ntime;
    };
};