const express = require("express");
const router = express.Router();
const path = require('path')
const axios = require('axios');
const moment = require('moment');



router.get("/relatorio", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SE1/CRED_PARC?raiz_cnpj='26615820';stats_parc='A';vencimento='20240923'`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data.objects[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
});

module.exports = router;