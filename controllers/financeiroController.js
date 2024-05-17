const express = require("express");
const financeiroModel = require("../models/financeiroModel");
const router = express.Router();
const path = require('path')
const axios = require('axios');
const moment = require('moment');

router.get("/analise-de-credito", async(req, res)=>{
    try {
        res.json(await financeiroModel.analiseDeCredito());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/atualiza-proposta-de-frete", async(req, res)=>{
    try {
        const mysql = require('mysql2/promise');

        // Consulta API TOTVS
        let jsonData = await axios.get(process.env.APITOTVS + "CONSULTA_SCJ/get_credito", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        jsonData = jsonData.data.objects

        // Função para conectar ao banco de dados
        async function connectToDatabase() {
        const connection = await mysql.createConnection({
            host: process.env.SQLHOST,
            user: process.env.SQLUSER,
            password: process.env.SQLPASSWORD,
            database: process.env.SQLDATABASE,
        });
        return connection;
        }

        // Função para inserir registros não coincidentes
        async function insertNonMatchingRecord(connection, record) {
        await connection.execute(`INSERT INTO ANALISE_CREDITO (
            DATA_SOLICIT,
            NUMERO_PEDIDO,
            FILIAL,
            LOJA,
            COD_CLIENTE,
            LOJA_ENTREGA,
            VENDEDOR,
            HORA_SOLICIT
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            record.CJ_XDTSOLI   || null, // DATA_SOLICIT
            //record.CJ_XSTACRE || null, // LEGENDA
            record.CJ_NUM       || null, // NUMERO_PEDIDO
            record.CJ_FILIAL    || null, // FILIAL
            record.CJ_LOJA      || null, // LOJA
            record.CJ_CLIENTE   || null, // COD_CLIENTE
            record.CJ_LOJAENT   || null, // LOJA_ENTREGA
            //record.CJ_VALOR   || null, // VALOR_PEDIDO
            //record.LIMITE     || null, // LIMITE_ATUAL
            record.CJ_XVEND1    || null, // VENDEDOR
            record.CJ_XHRSOLI    || null, // VENDEDOR

        ]);
        }

        // Função para comparar os dados JSON com os dados do MySQL
        async function compareDateTime() {
        const connection = await connectToDatabase();

        for (const jsonDataItem of jsonData) {
            const [rows] = await connection.execute(`
            SELECT ID, DATA_SOLICIT FROM ANALISE_CREDITO WHERE DATA_SOLICIT = ? AND HORA_SOLICIT = ? AND NUMERO_PEDIDO = ? AND FILIAL = ? AND LOJA = ? AND COD_CLIENTE = ?`, 
            [jsonDataItem.CJ_XDTSOLI, jsonDataItem.CJ_XHRSOLI, jsonDataItem.CJ_NUM, jsonDataItem.CJ_FILIAL, jsonDataItem.CJ_LOJA, jsonDataItem.CJ_CLIENTE]);

            if (rows.length <= 0) {
                await insertNonMatchingRecord(connection, jsonDataItem); // Insere o registro não coincidente
            }
        }

        await connection.end();
        }

        // Chama a função para comparar os dados
        compareDateTime().catch(err => console.error(err));
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


module.exports = router;