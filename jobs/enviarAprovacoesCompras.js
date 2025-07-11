// jobs/enviarAprovacoesCompras.js
const axios = require('axios');
const sqlProtheus = require('mssql');
require('dotenv').config();

const configProtheus = {
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    server: process.env.SQLSERVER_HOST,
    database: process.env.SQLSERVER_DATABASE,
    connectionTimeout: 180000,
    requestTimeout: 180000,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1826,
};

let poolProtheus;

async function connectProtheus() {
    if (!poolProtheus) {
        poolProtheus = await new sqlProtheus.ConnectionPool(configProtheus).connect();
    }
    return poolProtheus;
}

async function enviarAprovacoesCompras() {
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
    LEFT JOIN SC1010 C1 ON  C1.C1_NUM = C7_NUMSC AND C1.C1_ITEM = C7_ITEMSC AND C1.C1_FILIAL = C7.C7_FILIAL
      WHERE C7_CONAPRO = 'B' AND C7.R_E_C_D_E_L_ = 0 AND C7.C7_RESIDUO <> 'S' AND C7.C7_ENCER <> 'E' 
      GROUP BY C7.C7_FILIAL, C7.C7_NUM,C.M0_FILIAL,CTT.CTT_DESC01
    `;

        const pedidos = await request.query(queryCab);

        for (const pedido of pedidos.recordset) {
            const referenciaId = parseInt(pedido.C7_NUM);
            const referenciaFilial = parseInt(pedido.C7_FILIAL);
            let idAprovacao = null;

            try {
                const responseCab = await axios.post("http://intranet.fibracem.com/api/aprovacoes", {
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
                        { email: "eryck@fibracem.com", nivel_aprov: 3, status: null, datahora_resposta: null },
                        { email: "bitencourt@fibracem.com", nivel_aprov: 3, status: null, datahora_resposta: null },
                        { email: "carina@fibracem.com", nivel_aprov: 3, status: null, datahora_resposta: null }
                    ],
                });

                idAprovacao = responseCab.data?.id || null;
                if (!idAprovacao) continue;
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    continue;
                } else {
                    console.error(`Erro inesperado no pedido ${referenciaId}:`, error.message);
                    continue;
                }
            }

            // Itens
            const requestItens = pool.request();
            const queryItens = `
         SELECT C7_NUM, C7_PRODUTO ,C7_ITEM, C7_DESCRI, C7_GRUPCOM, C7_PRECO -(C7_VLDESC / C7_QUANT ) as C7_PRECO, C7_VLDESC , C7_TOTAL - C7_VLDESC AS  C7_TOTAL , C7_QUANT, C7_UM, C7_JUSTIFI
        FROM SC7010 
        WHERE C7_CONAPRO = 'B' AND R_E_C_D_E_L_ = 0 
          AND C7_FILIAL = '${pedido.C7_FILIAL}' AND C7_NUM = '${pedido.C7_NUM}'
      `;
            const itens = await requestItens.query(queryItens);

            for (const item of itens.recordset) {
                try {
                    await axios.post(`${process.env.INTRANET}api/aprovacoes/aprovacao-itens`, {
                        id_aprovacao_generica: idAprovacao,
                        codigo_ref: `${item.C7_NUM}-${item.C7_ITEM}`,
                        conteudo_json: [
                            { campo: "Item", valor: item.C7_DESCRI },
                            { campo: "Produto", valor: item.C7_PRODUTO },

                            { campo: "Valor Unit.", valor: `R$ ${item.C7_PRECO.toFixed(2)}` },
                            { campo: "Valor", valor: `R$ ${item.C7_TOTAL.toFixed(2)}` },
                            { campo: "Quantidade", valor: item.C7_QUANT.toString() },
                            { campo: "Unidade Medida", valor: item.C7_UM },
                            { campo: "Justificativa", valor: item.C7_JUSTIFI || "Sem justificativa informada" },
                            { campo: "Estoque<br>Atual 📦", valor: `${process.env.INTRANET}relatorios/totvs/estoque-atual?item=${item.C7_PRODUTO}` },
                            { campo: "Hist.<br>Quant.<br>Comprada 📊", valor: `${process.env.INTRANET}relatorios/totvs/ultimas-compras?item=${item.C7_PRODUTO}` },
                            { campo: "Hist.<br>Entrega 🚚", valor: `${process.env.INTRANET}relatorios/totvs/evolucao-entrega?item=${item.C7_PRODUTO}` },
                            { campo: "Hist.<br>Preço 💰", valor: `${process.env.INTRANET}relatorios/totvs/evolucao-preco?item=${item.C7_PRODUTO}` },
                            { campo: "Onde<br>Utiliza 🔍", valor: `${process.env.INTRANET}relatorios/totvs/onde-utiliza?item=${item.C7_PRODUTO}` },
                        ],
                    });
                } catch (error) {
                    console.error(`Erro ao enviar item ${item.C7_NUM}-${item.C7_ITEM}:`, error.message);
                }
            }
        }

        console.log("Execução automática finalizada com sucesso.");

    } catch (error) {
        console.error("Erro geral ao enviar aprovações automaticamente:", error.message);
    }
}

module.exports = enviarAprovacoesCompras;