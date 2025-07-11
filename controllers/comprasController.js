const express = require("express");
const router = express.Router();
const path = require('path')
const fs = require('fs')
const PDFKit = require('pdfkit');
const axios = require('axios');
const nodemailer = require('nodemailer');
const moment = require('moment');
const { Console } = require("console");
const dotenv = require("dotenv");
dotenv.config();
const sqlProtheus = require('mssql');

const configProtheus = {
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    server: process.env.SQLSERVER_HOST,
    database: process.env.SQLSERVER_DATABASE,
    connectionTimeout: 180000,
    requestTimeout: 180000,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1826
};

let poolProtheus;

const configProtheus_interno = {
    user: process.env.FIBRACEM_TOTVS_SQLSERVER_USER,
    password: process.env.FIBRACEM_TOTVS_SQLSERVER_PASSWORD,
    server: process.env.FIBRACEM_TOTVS_SQLSERVER_HOST,
    database: process.env.FIBRACEM_TOTVS_SQLSERVER_DATABASE,
    connectionTimeout: 180000,
    requestTimeout: 180000,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: 1433
};
let poolProtheus_interno;

async function connectProtheus() {
    try {
        if (!poolProtheus) {
            poolProtheus = await new sqlProtheus.ConnectionPool(configProtheus).connect();
        }
        return poolProtheus;
    } catch (err) {
        console.error('Failed to connect to Protheus SQL Server', err);
        throw err;
    }
}

async function connectProtheus_interno() {
    try {
        if (!poolProtheus_interno) {
            poolProtheus_interno = await new sqlProtheus.ConnectionPool(configProtheus_interno).connect();
        }
        return poolProtheus_interno;
    } catch (err) {
        console.error('Failed to connect to Protheus SQL Server', err);
        throw err;
    }
}

router.get("/compras-em-aprovacao", async(req, res)=>{
    const pool = await connectProtheus();
    const request = pool.request();

    const query = ` select C7.C7_FILIAL,C7.C7_NUM,MAX(C7.C7_OBS) AS OBS2,MAX(C7.C7_OBSM) AS OBS,MIN(C7.C7_EMISSAO) AS EMISSAO, MIN(USR_EMAIL) AS VENDEDOR_EMAIL, MIN(USR_CODIGO) AS VENDEDOR_NOME, MAX(A2_NOME) AS FORNECEDOR,
                           CASE
                               WHEN MAX(C7_TPFRETE) = 'F' THEN 'FOB - Responsabilidade do comprador'
                               WHEN MAX(C7_TPFRETE) = 'C' THEN 'CIF - Responsabilidade do vendedor'
                               ELSE MAX(C7_TPFRETE)
                               END AS TIPO_FRETE
                    from SC7010 C7
                             INNER JOIN SA2010 A2 ON C7.C7_FORNECE = A2.A2_COD AND C7_LOJA = A2.A2_LOJA
                             INNER JOIN SYS_USR US ON C7.C7_USER = US.USR_ID
                    WHERE C7_CONAPRO = 'B' and C7.R_E_C_D_E_L_ = 0 GROUP BY C7_FILIAL,C7_NUM `;

    const result = await request.query(query);
    res.json(result);
});



router.get("/itens-em-aprovacao", async(req, res)=>{
    const pool = await connectProtheus();
    const request = pool.request();

    const query = ` SELECT C7_FILIAL , C7_PRODUTO,  C7_UM, C7_QUANT, C7_PRECO, C7_TOTAL, C7_DINICOM, C7_OBSM,C7_OBS, C7_OBSFOR, C7_FORNECE, C7_DESCRI, C7_CONAPRO, C7_FLUXO, C7_FLUXO, C7_GRUPCOM, C7_USER,R_E_C_N_O_,R_E_C_D_E_L_,C7_JUSTIFI,C7_XFINALI,C7_ENCER
                    FROM SC7010 WHERE C7_CONAPRO = 'B'  `;

    const result = await request.query(query);
    res.json(result);
});

router.post("/verifica-alteracao", async (req, res) => {
    try {
        const pool = await connectProtheus();
        const request = pool.request();
        const query = `
            SELECT C7_FILIAL,C7_NUM , count(C7_ITEM) qtd_item ,SUM(C7_TOTAL) as total_pedido  FROM SC7010
            WHERE C7_CONAPRO = 'B' AND R_E_C_D_E_L_ = 0 AND C7_ENCER <> 'E'
            GROUP BY C7_FILIAL , C7_NUM  `;

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (error) {
        console.error('Erro na rota /verifica-alteracao:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});



router.post("/estoque-atual", async (req, res) => {
    try {
        const { CODIGO } = req.body;
        const pool = await connectProtheus();
        const request = pool.request();
        const query = `
            SELECT
                COMP.M0_FILIAL AS FILIAL,
                B1_COD    AS CODIGO_PRODUTO,
                B1_DESC   AS DESCRICAO,
                B1_UM     AS UNIDADE,
                NN.NNR_DESCRI AS ARMAZEM,
                B2_LOCAL  AS COD_ARMAZEM,
                B2_QATU   AS SALDO_ATUAL
            FROM
                SB2010 AS SB2
                    INNER JOIN
                SB1010 AS SB1 ON B1_COD = B2_COD AND SB2.D_E_L_E_T_ <> '*'
                    INNER JOIN NNR010 NN ON SB2.B2_LOCAL = NN.NNR_CODIGO AND  SB2.B2_FILIAL = NN.NNR_FILIAL AND NN.D_E_L_E_T_ <> '*'
                    INNER JOIN SYS_COMPANY COMP ON COMP.M0_CODFIL = SB2.B2_FILIAL
            WHERE
                LTRIM(RTRIM(B1_COD)) =    LTRIM(RTRIM(@CODIGO)) and  B2_QATU > 0 AND B2_LOCAL NOT IN ('99','98','01','RQ','80','81','Q1','51')
            ORDER BY
                B1_DESC; `;

        request.input('CODIGO', CODIGO)
        const result = await request.query(query);
        res.json(result.recordset);

    } catch (error) {
        console.error('Erro na rota /estoque-atual:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

router.post("/ultimas-compras", async (req, res) => {
    try {
        const { CODIGO } = req.body;
        const pool = await connectProtheus();
        const request = pool.request();
        const query = `
            SELECT C7.C7_FILIAL, C7_ENCER, C7_NUM, C7_PRODUTO, C7_ITEM, C7_DESCRI, C7_GRUPCOM, C7_PRECO, C7_TOTAL, C7_QUANT,C7_QUJE, C7_UM, C7_JUSTIFI,C7_DATPRF ,C7_RESIDUO,
                   CASE
                       WHEN C7_QUANT = 0 THEN 0
                       WHEN C7_RESIDUO = 'S' THEN 100
                       ELSE ROUND((C7_QUJE * 100.0) / C7_QUANT, 2)
                       END AS '% ENTREGUE'
            FROM SC7010 C7
                     LEFT JOIN SYS_COMPANY C ON C.M0_CODFIL = C7.C7_FILIAL
            WHERE LTRIM(RTRIM(C7_PRODUTO))  = LTRIM(RTRIM(@CODIGO))
              AND C7_CONAPRO = 'L'
              AND C7.R_E_C_D_E_L_ = 0
            ORDER BY C7_DATPRF asc  `;
        request.input('CODIGO', CODIGO)
        const result = await request.query(query);
        res.json(result.recordset);

    } catch (error) {
        console.error('Erro na rota /ultimas-compras:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

router.post("/onde-utiliza", async (req, res) => {
    try {
        const { CODIGO } = req.body;
        const pool = await connectProtheus_interno();
        const request = pool.request();
        const query = `
            SELECT SB.B1_COD , SB.B1_DESC
            FROM CST_SG1_ESTRUTURA SG
                     INNER JOIN FIBRA_SB1 SB
                                ON SG.G1_COD COLLATE SQL_Latin1_General_CP1_CI_AS = SB.B1_COD COLLATE SQL_Latin1_General_CP1_CI_AS
            WHERE
                LTRIM(RTRIM(SG.G1_COMP))   COLLATE SQL_Latin1_General_CP1_CI_AS = LTRIM(RTRIM(@CODIGO))
              AND SB.B1_TIPO = 'PA'; `;

        request.input('CODIGO', CODIGO)
        const result = await request.query(query);
        res.json(result.recordset);

    } catch (error) {
        console.error('Erro na rota /onde-utiliza:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});


router.post("/muda-status-compra", async (req, res) => {
    try {
        const { id, filial, status } = req.body;
        console.log("teste");
        const pool = await connectProtheus();
        const request = pool.request();
        const query = `
            UPDATE SC7010 SET C7_CONAPRO = @status WHERE C7_NUM = @id AND C7_FILIAL = @filial `;

        //res.json(query);

        request.input('id', id);
        request.input('filial', filial);
        request.input('status', status);

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (error) {
        console.error('Erro na rota /muda-status-compra:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});


router.post("/muda-aprovacao-compra", async (req, res) => {
    try {
        const { id, filial, status, nivel, email } = req.body;
        console.log("teste");
        const pool = await connectProtheus();
        const request = pool.request();
        const query = `
        -----uPDATE APROVAÇÃO DA ETAPA
        update SCR set   SCR.CR_DATALIB = CONVERT(VARCHAR(8), GETDATE(), 112)  , SCR.CR_VALLIB  = SCR.CR_TOTAL, SCR.CR_TIPOLIM =  'D', SCR.CR_LIBAPRO = SCR.CR_USER , SCR.CR_STATUS = @status 
        FROM SCR010 AS SCR INNER JOIN SYS_USR US ON SCR.CR_USER = US.USR_ID    WHERE SCR.CR_NUM = @id AND US.USR_EMAIL = @email AND SCR.D_E_L_E_T_ <> '*' and SCR.CR_NIVEL =  @nivel and SCR.CR_STATUS <> '03' and SCR.CR_FILIAL = @filial
        ----
        -----uPDATE PÓS APROVAÇÃO DA ETAPA
        update SCR set  SCR.CR_STATUS = '05'
        FROM SCR010 AS SCR INNER JOIN SYS_USR US ON SCR.CR_USER = US.USR_ID    WHERE SCR.CR_NUM = @id AND US.USR_EMAIL <> @email AND SCR.D_E_L_E_T_ <> '*' and SCR.CR_NIVEL = @nivel and SCR.CR_STATUS <> '03' and SCR.CR_FILIAL = @filial
        -----
        UPDATE SW2010 SET W2_CONAPRO = 'L' WHERE W2_PO_NUM = @id AND W2_FILIAL = @filial
`;

        //res.json(query);

        request.input('id', id);
        request.input('filial', filial);
        request.input('status', status);
        request.input('nivel', nivel);
        request.input('email', email);

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (error) {
        console.error('Erro na rota /muda-aprovacao-compra:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});




router.get("/enviar-aprovacoes-compras", async (req, res) => {
    const logRequisicoes = [];

    try {
        const pool = await connectProtheus();
        const request = pool.request();

        const queryCab = `
            SELECT C7.C7_FILIAL, COUNT(C7_ITEM) AS Qtd_item, CAST(ROUND(SUM(C7_TOTAL), 2) AS VARCHAR(10)) AS Total_pedido, C7.C7_NUM,
                   MAX(C7.C7_OBS) AS OBS2, MAX(C7.C7_OBSM) AS OBS, MIN(C7.C7_EMISSAO) AS EMISSAO,
                   MIN(USR_EMAIL) AS VENDEDOR_EMAIL, MIN(USR_CODIGO) AS VENDEDOR_NOME,
                   MAX(A2_NOME) AS FORNECEDOR,
                   CASE
                       WHEN MAX(C7_TPFRETE) = 'F' THEN 'FOB - Responsabilidade do comprador'
                       WHEN MAX(C7_TPFRETE) = 'C' THEN 'CIF - Responsabilidade do vendedor'
                       ELSE MAX(C7_TPFRETE)
                       END AS TIPO_FRETE,
                   C.M0_FILIAL AS FILIAL,
                   CTT.CTT_DESC01 AS 'CC',
                MAX(C1.C1_SOLICIT) AS SOLICITANTE
            FROM SC7010 C7
                     INNER JOIN SA2010 A2 ON C7.C7_FORNECE = A2.A2_COD AND C7_LOJA = A2.A2_LOJA
                     INNER JOIN SYS_USR US ON C7.C7_USER = US.USR_ID
                     INNER JOIN SYS_COMPANY C ON C.M0_CODFIL = C7.C7_FILIAL
                     INNER JOIN CTT010 CTT ON CTT.CTT_CUSTO = C7.C7_CC
                     LEFT JOIN SC1010 C1 ON  C1.C1_NUM = C7_NUMSC AND C1.C1_ITEM = C7_ITEMSC
            WHERE C7_CONAPRO = 'B' AND C7.R_E_C_D_E_L_ = 0 AND C7.C7_RESIDUO <> 'S' AND C7.C7_ENCER <> 'E'
            GROUP BY C7.C7_FILIAL, C7.C7_NUM,C.M0_FILIAL,CTT.CTT_DESC01
        `;

        const pedidos = await request.query(queryCab);

        for (const pedido of pedidos.recordset) {
            const referenciaId = parseInt(pedido.C7_NUM);
            const referenciaFilial = parseInt(pedido.C7_FILIAL);

            const payloadCab = {
                referencia_id: referenciaId,
                filial: referenciaFilial,
                descricao: `C.C: ${pedido.CC}  - Solicitante: ${pedido.SOLICITANTE} -  Fornecedor: ${pedido.FORNECEDOR}`,
                modulo: "Compras",
                enunciado: `Pedido ${pedido.C7_NUM} - ${pedido.FILIAL}`,
                qtd_item: `${pedido.Qtd_item}`,
                total_pedido: `${pedido.Total_pedido}`,
                urgencia: "Alta",
                email_rec: `${pedido.VENDEDOR_EMAIL}`,
                obs: pedido.OBS || "",
                autor_id: 42,
                user_id: 157,
                data_solicitacao: new Date().toISOString().split("T")[0],
                wf_json: [
                    { email: "sistema@fibracem.com", nivel_aprov: 1, status: null, datahora_resposta: null },
                    { email: "compras@fibracem.com", nivel_aprov: 1, status: null, datahora_resposta: null },
                    { email: "compras02@fibracem.com", nivel_aprov: 1, status: null, datahora_resposta: null },
                    { email: "compras03@fibracem.com", nivel_aprov: 1, status: null, datahora_resposta: null },
                    { email: "compras04@fibracem.com", nivel_aprov: 1, status: null, datahora_resposta: null },
                    { email: "comp.linhares@fibracem.com", nivel_aprov: 1, status: null, datahora_resposta: null },
                    { email: "suprimentos@fibracem.com", nivel_aprov: 2, status: null, datahora_resposta: null },
                    { email: "bitencourt@fibracem.com", nivel_aprov: 3, status: null, datahora_resposta: null },
                    { email: "eryck@fibracem.com", nivel_aprov: 3, status: null, datahora_resposta: null },
                    { email: "carina@fibracem.com", nivel_aprov: 3, status: null, datahora_resposta: null }
                ],
            };

            let idAprovacao = null;
            try {
                const responseCab = await axios.post("http://intranet.fibracem.com/api/aprovacoes", payloadCab);
                idAprovacao = responseCab.data?.id || null;

                logRequisicoes.push({
                    tipo: "cabecalho",
                    referencia: referenciaId,
                    status: responseCab.status,
                    resposta: responseCab.data,
                });

                if (!idAprovacao) {
                    logRequisicoes.push({
                        tipo: "cabecalho",
                        referencia: referenciaId,
                        erro: "Não retornou ID da aprovação",
                    });
                    continue;
                }

            } catch (error) {
                logRequisicoes.push({
                    tipo: "cabecalho",
                    referencia: referenciaId,
                    erro: error.message,
                    status: error.response?.status || null,
                    resposta: error.response?.data || null,
                });
                continue;
            }

            // Buscar e enviar os itens
            const requestItens = pool.request();
            const queryItens = `
        SELECT C7_NUM, C7_PRODUTO, C7_ITEM, C7_DESCRI, C7_GRUPCOM, C7_PRECO, C7_TOTAL, C7_QUANT, C7_UM, C7_JUSTIFI
        FROM SC7010 
        WHERE C7_CONAPRO = 'B' AND R_E_C_D_E_L_ = 0 
        AND C7_FILIAL = '${pedido.C7_FILIAL}' AND C7_NUM = '${pedido.C7_NUM}'
      `;
            const itens = await requestItens.query(queryItens);

            for (const item of itens.recordset) {
                const payloadItem = {
                    id_aprovacao_generica: idAprovacao,
                    codigo_ref: `${item.C7_NUM}-${item.C7_ITEM}`,
                    conteudo_json: [
                        { campo: "Item", valor: item.C7_DESCRI },
                        { campo: "Produto", valor: item.C7_PRODUTO },
                        { campo: "Quantidade", valor: item.C7_QUANT.toString() },
                        { campo: "Valor Unit.", valor: `R$ ${item.C7_PRECO.toFixed(2)}` },
                        { campo: "Valor", valor: `R$ ${item.C7_TOTAL.toFixed(2)}` },
                        { campo: "Unidade Medida", valor: item.C7_UM },
                        { campo: "Justificativa", valor: item.C7_JUSTIFI || "Sem justificativa informada" },
                        { campo: "Estoque<br>Atual 📦", valor: `http://intranet.fibracem.com/relatorios/totvs/estoque-atual?item=${item.C7_PRODUTO}` },
                        { campo: "Hist.<br>Quant.<br>Comprada 📊", valor: `http://intranet.fibracem.com/relatorios/totvs/ultimas-compras?item=${item.C7_PRODUTO}` },
                        { campo: "Hist.<br>Entrega 🚚", valor: `http://intranet.fibracem.com/relatorios/totvs/evolucao-entrega?item=${item.C7_PRODUTO}` },
                        { campo: "Hist.<br>Preço 💰", valor: `http://intranet.fibracem.com/relatorios/totvs/evolucao-preco?item=${item.C7_PRODUTO}` },
                        { campo: "Onde<br>Utiliza 🔍", valor: `http://intranet.fibracem.com/relatorios/totvs/onde-utiliza?item=${item.C7_PRODUTO}` }
                    ]
                };

                try {
                    const responseItem = await axios.post(
                        process.env.INTRANET + "api/aprovacoes/aprovacao-itens",
                        payloadItem
                    );
                    logRequisicoes.push({
                        tipo: "item",
                        referencia: `${item.C7_NUM}-${item.C7_ITEM}`,
                        status: responseItem.status,
                        resposta: responseItem.data,
                    });
                } catch (error) {
                    logRequisicoes.push({
                        tipo: "item",
                        referencia: `${item.C7_NUM}-${item.C7_ITEM}`,
                        erro: error.message,
                        status: error.response?.status || null,
                        resposta: error.response?.data || null,
                    });
                }
            }
        }

        res.json({
            message: "Processo finalizado.",
            logs: logRequisicoes,
        });

    } catch (error) {
        console.error("Erro geral:", error.message);
        res.status(500).json({
            error: "Falha ao enviar dados para o sistema de aprovação.",
            detalhes: error.message,
        });
    }
});



module.exports = router;
