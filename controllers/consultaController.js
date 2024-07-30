const axios = require('axios');
const { sql, connectToDatabase } = require('../services/dbConfig');

async function consultaCassia(req, res) {
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SB2/consulta_cassia`, {
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });
        
        res.send(response.data.objects)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaAmandinha(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`SELECT 
        B1_FILIAL,
        B1_COD,
        B1_DESC,
        B5_CEME,
        B1_TIPO,
        B1_UM,
        B1_PESO,
        B1_PESBRU,
        B1_CODBAR,
        B1_CODGTIN,
        B1_IMPORT,
        B1_IPI,
        B1_ORIGEM
        FROM SB1010 B1 INNER JOIN SB5010 AS B5 ON B1.B1_COD = B5.B5_COD`;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function sb2GetAll(req, res) {
    try {
        
        let response

        if(!req.query.updated_at){
            response = await axios.get(process.env.APITOTVS + `CONSULTA_SB2/get_all`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }else{
            response = await axios.get(process.env.APITOTVS + `CONSULTA_SB2/get_all?updated_at=${req.query.updated_at}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }
        
        res.send(response.data.objects)
    } catch (error) {
        if(error.response.status == 404){
            res.send("Nenhum resultado encontrado.")
        }else{
            console.log(error);
            res.sendStatus(500);
        }
    }
}

async function sb8GetAll(req, res) {
    try {
        
        let response

        if(!req.query.updated_at){
            response = await axios.get(process.env.APITOTVS + `CONSULTA_SB8/get_all`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }else{
            response = await axios.get(process.env.APITOTVS + `CONSULTA_SB8/get_all?updated_at=${req.query.updated_at}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }
        
        res.send(response.data.objects)
    } catch (error) {
        if(error.response.status == 404){
            res.send("Nenhum resultado encontrado.")
        }else{
            console.log(error);
            res.sendStatus(500);
        }
    }
}

async function sbfGetAll(req, res) {
    try {
        
        let response

        if(!req.query.updated_at){
            response = await axios.get(process.env.APITOTVS + `CONSULTA_SBF/get_all`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }else{
            response = await axios.get(process.env.APITOTVS + `CONSULTA_SBF/get_all?updated_at=${req.query.updated_at}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }
        
        res.send(response.data.objects)
    } catch (error) {
        if(error.response.status == 404){
            res.send("Nenhum resultado encontrado.")
        }else{
            console.log(error);
            res.sendStatus(500);
        }
    }
}

module.exports = { 
    consultaCassia,
    sb2GetAll,
    sb8GetAll,
    sbfGetAll,
    consultaAmandinha
};