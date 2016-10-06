/**
 * Created by Raphael on 11/01/2016.
 */

var assert = require('assert');
var FreeTime = require('./../../freetime');
var db = FreeTime.DB;

function CRUDModel(model, router) {
    var express = require('express');
    if (!router) router = express.Router();
    var log = model.log;
    var collection = db.get(model.database).collection(model.collection);
    var _CRUD = new FreeTime.CRUD(collection);

    // Função de log simples
    function flog(msg) {
        log && console.log('[FREETIME:REST] : ' + msg);
    };
    function fjson(json) {
        log && flog(JSON.stringify(json, null, 2));
    };
    // Função de log com erro
    function elog(msg) {
        log && console.error('[FREETIME:REST] : ' + msg);
    };

    // Rota default de adição
    router.post('/', function (req, res, next) {
        if (model.events && model.events.beforeInsert) model.events.beforeInsert(req, res, next);
        if (req.body.plural)
            next();
        else {
            flog('Inserindo [' + model.name + ']:');
            fjson(req.body);
            FreeTime.Utils.Conference(model, req.body, function (err, body) {
                if (err) {
                    elog(err);
                    if (model.events.afterInsert) return model.events.afterInsert(err, body, res);
                    return res.status(500).end('500 - Erro\n' + err + '\n' + body);
                }
                _CRUD.add(body, function (err, doc) {
                    if (model.events && model.events.afterInsert) return model.events.afterInsert(err, doc, res);
                    if (!err) {
                        flog('[' + model.name + '] inserido com sucesso!');
                        return res.json(doc._id);
                    } else {
                        elog('Erro ao inserir [' + model.name + ']!');
                        return res.status(500).end('500 - Erro\n' + err);
                    }
                });
            });
        }
    });

    // Rota default de adição multipla
    router.post('/', function (req, res) {
        flog('Inserindo multiplos [' + model.name + ']:');
        fjson(req.body.plural);
        var plural = req.body.plural;
        var log = new FreeTime.Utils.MultipleInsertLog(plural.length,
            function (log) {
                flog('Inserção múltipla de [' + model.name + ']: ');
                flog(JSON.stringify(log));
                return res.status(200).end('200 - Inserção múltipla\n' + JSON.stringify(log));
            });
        plural.forEach(function (singular) {
            FreeTime.Utils.Conference(model, singular, function (err, body) {
                if (err) {
                    switch (err) {
                        case FreeTime.Utils.ConferenceMSGS.BODY_INCOMPLETE:
                        case FreeTime.Utils.ConferenceMSGS.STRICT_INCORRECT:
                        case FreeTime.Utils.ConferenceMSGS.NOT_CHECK:
                        case FreeTime.Utils.ConferenceMSGS.DEFAULTS_MISSING:
                        case FreeTime.Utils.ConferenceMSGS.DEFAULTS_INCOMPLETE:
                            return log.addWrong();
                        default :
                            return log.addError();
                    }
                }
                else {
                    _CRUD.add(body, function (err, doc) {
                        if (err) return log.addError();
                        return log.addIns();
                    });
                }
            });
        });
    });

    // Rota default de busca por Id
    router.get('/id/:id', function (req, res, next) {
        if (model.events && model.events.beforeGet) model.events.afterInsert(req, res, next);
        flog('Buscando [' + model.name + '] por Id:');
        fjson(req.params.id);
        if (req.params.id) {
            _CRUD.get(req.params.id, function (err, doc) {
                if (model.events && model.events.afterGet) return model.events.afterGet(err, doc, res);
                if (!err) {
                    flog('[' + model.name + '] encontrado com sucesso!');
                    return res.json(doc);
                } else {
                    elog('Erro ao buscar [' + model.name + ']!');
                    return res.status(500).end('500 - Erro\n' + err);
                }
            });
        } else {
            return res.status(400).end('400 - Má requisição\nFaltando parâmetro [id] na URL.');
        }
    });

    // Rota opcional de busca por UserId
    if (model.content.userId) {
        router.get('/userid/:userid', function (req, res, next) {
            if (model.events && model.events.beforeUserGet) model.events.beforeUserGet(req, res, next);
            flog('Buscando [' + model.name + '] por userId:');
            fjson(req.params.userid);
            if (req.params.userid) {
                _CRUD.userId(req.params.userid, function (err, doc) {
                    if (model.events && model.events.afterUserGet) return model.events.afterUserGet(err, doc);
                    if (!err) {
                        flog('[' + model.name + '] encontrado com sucesso!');
                        return res.json(doc);
                    } else {
                        elog('Erro ao buscar [' + model.name + ']!');
                        return res.status(500).end('500 - Erro\n' + err);
                    }
                });
            } else {
                return res.status(400).end('400 - Má requisição\nFaltando parâmetro [userid] na URL.');
            }
        });
    }

    // Rota default de busca por todos registros
    router.get('/all', function (req, res, next) {
        if (model.events && model.events.beforeGets) model.events.beforeGets(req, res, next);
        flog('Buscando todos [' + model.name + ']:');
        _CRUD.gets(function (err, doc) {
            if (model.events && model.events.afterGets) return model.events.afterGets(err, doc, res);
            if (!err) {
                flog('[' + model.name + '] encontrados com sucesso!');
                if (req.query.callback) return res.jsonp(doc);
                return res.json(doc);
            } else {
                elog('Erro ao buscar [' + model.name + ']!');
                return res.status(500).end('500 - Erro\n' + err);
            }
        });
    });

    // Rota default de atualização de dados
    router.put('/id/:id', function (req, res, next) {
        if (model.events && model.events.beforeUpdate) model.events.beforeUpdate(req, res, next);
        flog('Atualizando [' + model.name + '] por Id:');
        fjson(req.params.id);
        flog('Parametros de atualizacao:');
        fjson(req.body);
        if (req.params.id) {
            _CRUD.update(req.params.id, req.body, function (err, doc) {
                if (model.events && model.events.afterUpdate) return model.events.afterUpdate(err, doc, res);
                if (!err) {
                    flog('[' + model.name + '] atualizado com sucesso!');
                    return res.json(doc);
                } else {
                    elog('Erro ao atualizar [' + model.name + ']!');
                    return res.status(500).end('500 - Erro\n' + err);
                }
            });
        } else {
            return res.status(400).end('400 - Má requisição\nFaltando parâmetro [id] na URL.');
        }
    });

    // Rota default de deletar por Id
    router.delete('/:id', function (req, res, next) {
        if (model.events && model.events.beforeDelete) model.events.beforeDelete(req, res, next);
        flog('Excluindo [' + model.name + '] por id:');
        fjson(req.params.id);
        if (req.params.id) {
            _CRUD.delete(req.params.id, function (err, doc) {
                if (model.events && model.events.afterDelete) return model.events.afterDelete(err, doc, res);
                if (!err) {
                    flog('[' + model.name + '] deletado com sucesso!');
                    return res.json(doc);
                } else {
                    elog('Erro ao deletar [' + model.name + ']!');
                    return res.status(500).end('500 - Erro\n' + err);
                }
            });
        } else {
            return res.status(400).end('400 - Má requisição\nFaltando parâmetro [id] na URL.');
        }
    });

    return router;
}

module.exports = CRUDModel;
