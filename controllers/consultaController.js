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

module.exports = { 
    consultaCassia, 
};