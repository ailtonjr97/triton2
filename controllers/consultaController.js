const axios = require('axios');
const { sql, connectToDatabase } = require('../services/dbConfig');
// const { sqlKorp, connectToDatabaseKorp } = require('../services/dbConfigKorp');
const comercialModel = require("../models/comercialModel.js");
const financeiroModel = require("../models/financeiroModel.js");


async function consultaAnaliseCreditoLuiz(req, res) {
    try {
        res.json(await financeiroModel.consultaLuiz());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

// async function consultaHistlise(req, res) {
//     try {
//         await connectToDatabaseKorp();
//         const query = await sqlKorp.query`
//             SELECT DISTINCT
//             H.ITEM,
//             H.DESCRI,
//             H.UNIDADE,
//             CATEGORIA,                                              
//             E.FAMILIA,
//             E.CODGRUPO, 
//             E.CODSUBGRUPO,
//             E.CT_NBM,
//             NBM.CLASSIFICACAO,
//             E.LTFORNECE,
//             E.LTRECEB,
//             E.LTTRANSP,
//             E.STATUS,
//             E.CT_ORIGEM_MERCADORIA ,
//             M.DESCRICAO,
//             E.CT_ICMS_GRUPO,
//             I.DESCRICAO AS DESC_GRUPO_ICMS,
//             E.RECNO_CT_ESPECIE_CFOP,
//             E.SITTRIBUT_IPI_AUX, 
//             E.SITTRIBUT_PIS_AUX,
//             E.SITTRIBUT_COFINS_AUX
//             FROM HISTLISE H (NOLOCK)  
//             INNER JOIN ESTOQUE E ON E.CODIGO = H.ITEM
//             INNER JOIN CT_ICMS_GRUPO I ON I.CODIGO = E.CT_ICMS_GRUPO
//             INNER JOIN CT_NBM NBM ON NBM.CODIGO = E.CT_NBM
//             INNER JOIN CT_ORIGEM_MERCADORIA M ON M.CODIGO = E.CT_ORIGEM_MERCADORIA
//             WHERE EFETUADOENTR = 'S'
//             ORDER BY ITEM
//         `;

//         res.send(query.recordset);
//     } catch (error) {
//         console.log(error);
//         res.sendStatus(500);
//     }
// };

async function consultaCotFrete(req, res) {
    try {
        res.json(await comercialModel.allConsulta());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaChamadosManutInd(req, res) {
    try {
        res.json(await comercialModel.allManutInd());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaStatusChamados(req, res) {
    try {
        res.json(await comercialModel.allStatusChamados());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaUrgenciasChamados(req, res) {
    try {
        res.json(await comercialModel.allUrgenciasChamados());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaAreasChamados(req, res) {
    try {
        res.json(await comercialModel.allAreasChamados());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaOperacoesChamados(req, res) {
    try {
        res.json(await comercialModel.allOperacoesChamados());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaAllUsers(req, res) {
    try {
        res.json(await comercialModel.allUsers());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaAllEmpresas(req, res) {
    try {
        res.json(await comercialModel.allEmpresas());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaAllTipoManuts(req, res) {
    try {
        res.json(await comercialModel.allTipoManuts());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaAllSubTipoManuts(req, res) {
    try {
        res.json(await comercialModel.allSubTipoManuts());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaAllCentroCusto(req, res) {
    try {
        res.json(await comercialModel.allCentroCusto());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaSb1(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
            SELECT * FROM SB1010
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaUniaoDa0Da1(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
            SELECT 
            DA1_FILIAL AS FILIAL,
            DA1_CODTAB AS TABELA,
            DA1_CODPRO AS PRODUTO,
            DA1_PRCVEN AS PRECO,
            D2.DA0_DESCRI AS CARTEIRA,
            CASE WHEN D1. R_E_C_D_E_L_ = 0 THEN 'ATIVO' ELSE 'INATIVO' END AS STATUS FROM DA1010 D1
            INNER JOIN DA0010 D2 ON D2.DA0_FILIAL = D1.DA1_FILIAL AND D2.DA0_CODTAB = D1.DA1_CODTAB
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaDa0010(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`SELECT * FROM DA0010`;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaDa1010(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`SELECT CAST(DA1_PRCVEN AS DECIMAL(19,6)) AS 'PRECO', * FROM DA1010`;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaSolicitacoesDeCompra(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`SELECT * FROM SC1010`;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaMichelleAlguns(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
            SELECT A1_COD AS 'COD. CLIENTE', A1_NOME AS 'NOME CLIENTE', A1_MUN AS 'MUNICIPIO', 
            A1_VEND AS 'COD. VENDEDOR', A3_NOME AS 'NOME VENDEDOR', C5_NUM AS 'NUMERO PEDIDO', 
            C5_XHEXPED 'EXPEDIDO', A1_XCARTEI 'CARTEIRA', A1_GRPVEN 'GRUPO DE VENDA' FROM SA1010
            INNER JOIN SA3010 VEND ON SA1010.A1_VEND = VEND.A3_COD
            INNER JOIN SC5010 PED ON SA1010.A1_COD = PED.C5_CLIENTE AND SA1010.A1_LOJA = PED.C5_LOJACLI
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaMichelleTudo(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
            SELECT A1_COD AS 'COD. CLIENTE', A1_NOME AS 'NOME CLIENTE', A1_MUN AS 'MUNICIPIO', 
            A1_VEND AS 'COD. VENDEDOR', A3_NOME AS 'NOME VENDEDOR', C5_NUM AS 'NUMERO PEDIDO', 
            C5_XHEXPED 'EXPEDIDO', A1_XCARTEI 'CARTEIRA', A1_GRPVEN 'GRUPO DE VENDA' FROM SA1010
            LEFT JOIN SA3010 VEND ON SA1010.A1_VEND = VEND.A3_COD
            LEFT JOIN SC5010 PED ON SA1010.A1_COD = PED.C5_CLIENTE AND SA1010.A1_LOJA = PED.C5_LOJACLI
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function consultaHerica(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`SELECT * FROM SA1010 WHERE A1_XCARTEI = '000042' AND A1_VEND = '000008' `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

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
};

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
};

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
};

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
};

async function sbzGetAll(req, res) {
    try {
        await connectToDatabase();
        const query = await sql.query`
            SELECT * FROM SBZ010
        `;

        res.send(query.recordset);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

module.exports = { 
    consultaCassia,
    sb2GetAll,
    sb8GetAll,
    sbfGetAll,
    consultaAmandinha,
    consultaHerica,
    consultaMichelleAlguns,
    consultaMichelleTudo,
    consultaSolicitacoesDeCompra,
    consultaDa0010,
    consultaDa1010,
    consultaUniaoDa0Da1,
    //consultaHistlise,
    consultaSb1,
    consultaCotFrete,
    consultaAnaliseCreditoLuiz,
    consultaChamadosManutInd,
    consultaStatusChamados,
    consultaUrgenciasChamados,
    consultaAreasChamados,
    consultaOperacoesChamados,
    consultaAllUsers,
    consultaAllEmpresas,
    consultaAllTipoManuts,
    consultaAllSubTipoManuts,
    consultaAllCentroCusto,
    sbzGetAll
};