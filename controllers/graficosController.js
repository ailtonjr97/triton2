const axios = require('axios');
const { sql, connectToDatabase } = require('../services/dbConfig');

async function pedQuantMes(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
        SELECT 
        SUBSTRING(C5_EMISSAO, 1, 7) AS ano_mes, -- Extrai o ano e o mês no formato 'AAAA/MM'
        COUNT(*) AS total_registros -- Conta o número de registros por mês
        FROM SC5010
        WHERE SUBSTRING(C5_EMISSAO, 1, 4) = '2025' -- Filtra apenas o ano de 2025
        GROUP BY SUBSTRING(C5_EMISSAO, 1, 7)
        ORDER BY ano_mes;
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function pedQuantMesVend(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
        SELECT 
            SA3010.A3_NREDUZ AS NOME,
            (
                SELECT 
                    COUNT(SC5010.ID) AS total_pedidos
                FROM SC5010
                WHERE SC5010.C5_VEND1 = SA3010.A3_COD
                AND SUBSTRING(SC5010.C5_EMISSAO, 1, 4) = '2025'
                GROUP BY SUBSTRING(SC5010.C5_EMISSAO, 6, 2)
                ORDER BY SUBSTRING(SC5010.C5_EMISSAO, 6, 2) ASC
                FOR JSON PATH
            ) AS PEDIDOS
        FROM SA3010
        WHERE EXISTS (
            SELECT 1 
            FROM SC5010 
            WHERE SC5010.C5_VEND1 = SA3010.A3_COD
            AND SUBSTRING(SC5010.C5_EMISSAO, 1, 4) = '2025'
        ) 
        AND SA3010.R_E_C_D_E_L_ = 0 
        AND SA3010.A3_COD NOT IN ('000001', '000012', '000016', '000017', '000020', '000022', '000021', '000024', '000027', '000029', '000030', '000028', '000033', '000026')
        AND SA3010.A3_XSETOR = ${req.query.setor}
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function orcQuantMes(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
        SELECT 
        SUBSTRING(CJ_EMISSAO, 1, 7) AS ano_mes, -- Extrai o ano e o mês no formato 'AAAA/MM'
        COUNT(*) AS total_registros -- Conta o número de registros por mês
        FROM SCJ010
        WHERE SUBSTRING(CJ_EMISSAO, 1, 4) = '2025' -- Filtra apenas o ano de 2025
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
            SA3010.A3_NREDUZ AS NOME,
            (
                SELECT 
                    COUNT(SCJ010.ID) AS total_orcamentos
                FROM SCJ010
                WHERE SCJ010.CJ_XVEND1 = SA3010.A3_COD
                AND SUBSTRING(SCJ010.CJ_EMISSAO, 1, 4) = '2025'
                GROUP BY SUBSTRING(SCJ010.CJ_EMISSAO, 6, 2)
                ORDER BY SUBSTRING(SCJ010.CJ_EMISSAO, 6, 2) ASC  -- Alterado para ASC
                FOR JSON PATH
            ) AS ORCAMENTOS
        FROM SA3010
        WHERE EXISTS (
            SELECT 1 
            FROM SCJ010 
            WHERE SCJ010.CJ_XVEND1 = SA3010.A3_COD
            AND SUBSTRING(SCJ010.CJ_EMISSAO, 1, 4) = '2025'
        ) 
        AND SA3010.R_E_C_D_E_L_ = 0 
        AND SA3010.A3_COD NOT IN ('000001', '000012', '000016', '000017', '000020', '000022', '000021', '000024', '000027', '000029', '000030', '000028', '000033', '000026')
        AND SA3010.A3_XSETOR = ${req.query.setor}
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

module.exports = { 
    orcQuantMes,
    orcQuantMesVend,
    pedQuantMes,
    pedQuantMesVend
};