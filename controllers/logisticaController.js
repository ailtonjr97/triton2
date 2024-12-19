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
        res.json(await logisticaModel.produtoOne(req.query.codigo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function inventario(req, res) {
    try {
        let codigo = req.query.codigo;
        codigo = codigo.toUpperCase();
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SB1/codigo?codigo=" + codigo, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
};

async function armazem(req, res) {
    try {
        const {filial, item, endereco, localiza} = req.query
        if(!filial || !item || !endereco || !localiza){
            res.status(400).send('Falta de parametros.')
        }else{
            const response = await axios.get(`${process.env.APITOTVS}CONSULTA_SBF/item-endereco?filial=${filial}&item=${item}&endereco=${endereco}&localiza=${localiza}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
            res.json(response.data.objects[0].QUANT_TOTAL);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
};


module.exports = { 
    produtosAll,
    produtoOne,
    inventario,
    armazem
};