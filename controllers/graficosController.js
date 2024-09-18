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

async function orcQuantMesVend(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
        SELECT 
            LEFT(SA3010.A3_NOME, CHARINDEX(' ', SA3010.A3_NOME + ' ') - 1) AS NOME, 
            (
                SELECT 
                    COUNT(SCJ010.ID) AS total_orcamentos
                FROM SCJ010
                WHERE SCJ010.CJ_XVEND1 = SA3010.A3_COD
                AND SUBSTRING(SCJ010.CJ_EMISSAO, 1, 4) = '2024'
                GROUP BY SUBSTRING(SCJ010.CJ_EMISSAO, 6, 2)
                ORDER BY SUBSTRING(SCJ010.CJ_EMISSAO, 6, 2) DESC
                FOR JSON PATH
            ) AS ORCAMENTOS
        FROM SA3010
        WHERE EXISTS (
            SELECT 1 
            FROM SCJ010 
            WHERE SCJ010.CJ_XVEND1 = SA3010.A3_COD
            AND SUBSTRING(SCJ010.CJ_EMISSAO, 1, 4) = '2024'
        )
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

module.exports = { 
    orcQuantMes,
    orcQuantMesVend
};