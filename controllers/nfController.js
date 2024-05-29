const express = require("express");
const router = express.Router();
const path = require('path')
const axios = require('axios');
const moment = require('moment');

async function nota(req, res) {
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SF2/get_all_id?filial=0101001&cli=C10741&doc=000127577&loja=0009`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}

async function itens(req, res) {
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_Sd2/get_all_id?filial=0101001&cli=F03558&doc=000127316&loja=0001`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}


module.exports = { 
    nota,
    itens,
};