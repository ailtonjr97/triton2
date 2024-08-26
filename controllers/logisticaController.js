const logisticaModel = require('../models/logisticaModel');

async function produtosAll(req, res) {
    try {
        const {codigo = ''} = req.query;
        res.json(await logisticaModel.produtosAll(codigo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function produtoOne(req, res) {
    try {
        res.json(await logisticaModel.produtoOne(req.query.filial, req.query.codigo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

module.exports = { 
    produtosAll,
    produtoOne
};