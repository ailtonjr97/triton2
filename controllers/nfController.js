const express = require("express");
const router = express.Router();
const path = require('path')
const axios = require('axios');
const moment = require('moment');

async function nota(req, res) {
    const { filial, cli, doc, loja } = req.query; // Extrai os parâmetros da query string
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SF2/get_all_id?filial=${filial}&cli=${cli}&doc=${doc}&loja=${loja}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}


async function itens(req, res) {
    const { filial, cli, doc, loja } = req.query; // Extrai os parâmetros da query string
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SD2/get_all_id?filial=${filial}&cli=${cli}&doc=${doc}&loja=${loja}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
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