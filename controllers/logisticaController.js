const logisticaModel = require('../models/logisticaModel');
const axios = require('axios');

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

async function inventario(req, res) {
    try {
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SB1/codigo?codigo=" + req.query.codigo, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
};


module.exports = { 
    produtosAll,
    produtoOne,
    inventario
};