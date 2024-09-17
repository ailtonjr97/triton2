const axios = require('axios');
const { sql, connectToDatabase } = require('../services/dbConfig');

async function orcQuantMes(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
        SELECT 
        SUBSTRING(CJ_EMISSAO, 1, 7) AS ano_mes, -- Extrai o ano e o mês no formato 'AAAA/MM'
        COUNT(*) AS total_registros -- Conta o número de registros por mês
        FROM SCJ010
        WHERE SUBSTRING(CJ_EMISSAO, 1, 4) = '2024' -- Filtra apenas o ano de 2024
        GROUP BY SUBSTRING(CJ_EMISSAO, 1, 7)
        ORDER BY ano_mes;
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

module.exports = { 
    orcQuantMes
};