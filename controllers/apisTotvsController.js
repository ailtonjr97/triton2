const express = require("express");
const ApisTotvs = require("../models/apisTotvsModel")
const router = express.Router();
const axios = require('axios');

router.get("/api/lista", async(req, res)=>{
    try {
        res.send(await ApisTotvs.all())
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.post("/api/lista", async(req, res)=>{
    try {
        await ApisTotvs.create(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/api/acy/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get('acy'))
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/acy/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_ACY/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_ACY/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([response.grpven, response.descri]) 
        });
        await ApisTotvs.updateAcy(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)  
    }
})

router.get("/api/d12/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("d12"))
    } catch (error) {
        console.log(error)
        res.sendStatus(500) 
    }
})

router.get("/api/d12/get_one/:id", async(req, res)=>{
    try {
        res.send(await ApisTotvs.getOne("d12", req.params.id))
    } catch (error) {
        console.log(error)
        res.sendStatus(500) 
    }
})

router.post("/api/d12/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_D12/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_D12/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.filial,
                response.produt,
                response.lotect,
                response.doc,
                response.serie,
                response.clifor,
                response.loja,
                response.status,
                response.servic,
                response.qtdori,
                response.qtdlid,
                response.endori,
                response.locdes,
                response.enddes,
                response.rechum,
            ]) 
        });
        await ApisTotvs.updateD12(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)  
    }
})

router.get("/api/d14/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("d14"))
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/d14/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_D14/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_D14/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.filial,
                response.local,
                response.ender,
                response.produt,
                response.lotect,
                response.dtvald,
                response.dtfabr,
                response.estfis,
                response.qtdest,
                response.qtdepr,
                response.qtdspr,
                response.qtdblq,
                response.idunit
            ]) 
        });
        await ApisTotvs.updateD14(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/dcf/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("dcf"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/dcf/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_DCF/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_DCF/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.filial,
                response.lotect,
                response.servic,
                response.docto,
                response.serie,
                response.codpro,
                response.clifor,
                response.loja,
                response.quant,
                response.qtdori,
                response.local,
                response.ender,
                response.locdes,
                response.enddes,
                response.stserver
            ])
        });
        await ApisTotvs.updateDcf(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/se4/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("se4"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/se4/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_SE4/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SE4/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.filial,
                response.codigo,
                response.tipo,
                response.cond,
                response.descri
            ])
        });
        await ApisTotvs.updateSe4(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sb1/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("sb1"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/sb1/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_PRO/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_PRO/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.cod,
                response.tipo,
                response.um,
                response.grupo,
                response.peso,
                response.urev,
                response.descri,
                response.pesbru
            ])
        });
        await ApisTotvs.updateSb1(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sa1/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("sa1"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/sa1/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_SA1/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SA1/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.cod,
                response.nome,
                response.cod_mun,
                response.mun,
                response.nreduz,
                response.grpven,
                response.loja,
                response.end,
                response.codpais,
                response.est,
                response.cep,
                response.tipo,
                response.cgc,
                response.filial,
                response.xcartei
            ])
        });
        await ApisTotvs.updateSa1(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sc5/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("sc5"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/sc5/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_SC5/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SC5/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.nota,
                response.tpfrete,
                response.condpag,
                response.tipocli,
                response.blq,
                response.liberok,
                response.lojacli,
                response.vend1,
                response.cliente,
                response.tipo,
                response.num,
                response.emissao,
                response.xflagtr,
                response.filial,
                response.xpedtr
            ])
        });
        await ApisTotvs.updateSc5(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sc6/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("sc6"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/sc6/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_SC6/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SC6/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.loja,
                response.num,
                response.item,
                response.produto,
                response.qtdven,
                response.qtdent,
                response.prcven,
                response.descont,
                response.valor,
                response.oper,
                response.tes,
                response.cf,
                response.cli,
                response.entreg,
                response.datfat,
                response.nota,
                response.blq,
                response.filial
            ])
        });
        await ApisTotvs.updateSc6(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sc9/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("sc9"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/sc9/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_SC9/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SC9/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.filial,
                response.pedido,
                response.item,
                response.cliente,
                response.loja,
                response.produto,
                response.qtdlib,
                response.nfiscal,
                response.datalib,
                response.bloquei,
                response.blest,
                response.datent
            ])
        });
        await ApisTotvs.updateSc9(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sf2/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("sf2"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/sf2/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_SF2/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SF2/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.emissao,
                response.filial,
                response.chvnfe,
                response.doc,
                response.serie,
                response.cliente,
                response.loja,
                response.tipocli,
                response.vend1,
                response.fimp
            ])
        });
        await ApisTotvs.updateSf2(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sx5", async(req, res)=>{
    try {
        res.send(await ApisTotvs.getSx5(req.query.tabela, req.query.chave));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/api/sx5/get_all", async(req, res)=>{
    try {
        res.send(await ApisTotvs.get("sx5"));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/api/sx5/update", async(req, res)=>{
    try {
        const values = [];
        const limitador = await axios.get(process.env.APITOTVS + "CONSULTA_X5/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_X5/get_all?limit=" + limitador.data.meta.total, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        response.data.objects.forEach(response => {
            values.push([
                response.filial,
                response.tabela,
                response.chave,
                response.descri,
                response.descspa,
                response.desceng
            ])
        });
        await ApisTotvs.updateSx5(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/companies", async(req, res)=>{
    try {
        const statusTotvs = await axios.get(process.env.APITOTVS + "api/framework/environment/v1/companies", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(statusTotvs.data);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;