const express = require("express");
const router = express.Router();
const path = require('path')
const axios = require('axios');
const moment = require('moment');

async function nota(req, res) {
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SE1/CRED_PARC?stats_parc=A&raiz_cnpj=26`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data.objects[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}

module.exports = { 
    nota,
};