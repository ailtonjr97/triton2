const axios = require('axios');

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
    sbfGetAll
};