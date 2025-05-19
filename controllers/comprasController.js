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


router.get("/enviar-aprovacoes-compras", async (req, res) => {
  try {
    const pool = await connectProtheus();
    const request = pool.request();

    // Buscar todos os pedidos em aprovação
    const queryCab = `
      SELECT C7.C7_FILIAL, C7.C7_NUM, MAX(C7.C7_OBS) AS OBS2, MAX(C7.C7_OBSM) AS OBS,
      MIN(C7.C7_EMISSAO) AS EMISSAO, MIN(USR_EMAIL) AS VENDEDOR_EMAIL,
      MIN(USR_CODIGO) AS VENDEDOR_NOME, MAX(A2_NOME) AS FORNECEDOR,
      CASE 
          WHEN MAX(C7_TPFRETE) = 'F' THEN 'FOB - Responsabilidade do comprador'
          WHEN MAX(C7_TPFRETE) = 'C' THEN 'CIF - Responsabilidade do vendedor'
          ELSE MAX(C7_TPFRETE)
      END AS TIPO_FRETE
      FROM SC7010 C7 
      INNER JOIN SA2010 A2 ON C7.C7_FORNECE = A2.A2_COD AND C7_LOJA = A2.A2_LOJA
      INNER JOIN SYS_USR US ON C7.C7_USER = US.USR_ID 
      WHERE C7_CONAPRO = 'B' AND C7.R_E_C_D_E_L_ = 0 AND C7_ENCER <> 'E' 
      GROUP BY C7.C7_FILIAL, C7.C7_NUM
    `;

    const pedidos = await request.query(queryCab);

    for (const pedido of pedidos.recordset) {
      const referenciaId = parseInt(pedido.C7_NUM);
      const referenciaFilial = parseInt(pedido.C7_FILIAL);

      // Enviar cabeçalho
      const responseCab = await axios.post("http://192.168.0.88/api/aprovacoes", {
        referencia_id: referenciaId,
        filial: referenciaFilial,      
        descricao: `Solicitação de compra para o fornecedor ${pedido.FORNECEDOR} - ${pedido.TIPO_FRETE}`,
        modulo: "Compras",
        enunciado: `Pedido ${pedido.C7_NUM}`,
        urgencia: "Alta",
        obs: pedido.OBS || "",
        autor_id: 42,
        user_id: 157,
        data_solicitacao: new Date().toISOString().split("T")[0],
        wf_json: [
          { email: "sistema@fibracem.com", nivel_aprov: 1, status: null, datahora_resposta: null },
          { email: "informatica03@fibracem.com", nivel_aprov: 2, status: null, datahora_resposta: null },
          { email: "informatica06@fibracem.com", nivel_aprov: 3, status: null, datahora_resposta: null }
        ]
      });
     // console.log("Resposta da criação da aprovação:", responseCab.data);

      const idAprovacao = responseCab.data?.id || null;
      if (!idAprovacao) {
        console.warn(`Pedido ${referenciaId} não retornou ID da aprovação.`);
        continue;
      }

      // Buscar os itens vinculados ao pedido
      const requestItens = pool.request();
      const queryItens = `
        SELECT C7_NUM, C7_ITEM, C7_DESCRI, C7_GRUPCOM, C7_TOTAL, C7_QUANT, C7_UM, C7_JUSTIFI
        FROM SC7010 
        WHERE C7_CONAPRO = 'B' AND R_E_C_D_E_L_ = 0 AND C7_ENCER <> 'E' AND C7_FILIAL = '${pedido.C7_FILIAL}' AND C7_NUM = '${pedido.C7_NUM}'
      `;
      const itens = await requestItens.query(queryItens);

      // Enviar cada item com o ID da aprovação
      for (const item of itens.recordset) {
        await axios.post("http://192.168.0.88/api/aprovacoes/aprovacao-itens", {
          id_aprovacao_generica: idAprovacao,
          codigo_ref: `${item.C7_NUM}-${item.C7_ITEM}`,
          conteudo_json: [
            { campo: "Item", valor: item.C7_DESCRI },
            { campo: "Departamento", valor: item.C7_GRUPCOM },
            { campo: "Valor", valor: `R$ ${item.C7_TOTAL.toFixed(2)}` },
            { campo: "Quantidade", valor: item.C7_QUANT.toString() },
            { campo: "Unidade Medida", valor: item.C7_UM },
            { campo: "Relatorio 1", valor: "http://192.168.0.88/aprovacoes/painel-aprovacoes?data_inicio=2025-04-30&data_fim=2025-07-23" },
            { campo: "Relatorio 2", valor: "http://192.168.0.88/aprovacoes/painel-aprovacoes?data_inicio=2025-04-30&data_fim=2025-07-23" },
            { campo: "Relatorio 3", valor: "http://192.168.0.88/aprovacoes/painel-aprovacoes?data_inicio=2025-04-30&data_fim=2025-07-23" },
            { campo: "Justificativa", valor: item.C7_JUSTIFI || "Sem justificativa informada" }
          ]
        });
      }
    }

    res.json({ message: "Pedidos e itens enviados com sucesso!" });

  } catch (error) {
    console.error("Erro ao enviar aprovações:", error.message);
    res.status(500).json({ error: "Falha ao enviar dados para o sistema de aprovação." });
  }
});


module.exports = router;

