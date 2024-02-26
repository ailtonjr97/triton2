const express = require("express");
const korpModel = require("../models/korpModel")
const router = express.Router();
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const PDFKit = require('pdfkit');

router.get("/produtos/get_all", async(req, res)=>{
    try {
        res.json(await korpModel.all())
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/produtos/pesquisa", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        res.json(await korpModel.search(req.query.codigo, resultados, req.query.nome));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produtos/excel", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        const response = await korpModel.search(req.query.codigo, resultados, req.query.nome);
        const workSheet = XLSX.utils.json_to_sheet(response);
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "produtos");
        const aleat = Math.round(Math.random() * 1000)
        XLSX.writeFile(workBook, `./temp/produtos${aleat}.xlsx`);
        res.sendFile(path.join(__dirname, '..', 'temp', `produtos${aleat}.xlsx`))
        setTimeout(()=>{
            fs.unlinkSync(`./temp/produtos${aleat}.xlsx`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produtos/pdf", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        const pdf = new PDFKit();
        const aleat = Math.round(Math.random() * 1000);
        const response = await korpModel.search(req.query.codigo, resultados, req.query.nome);
        response.forEach(element => {
            pdf.text(element.CODIGO + " - " + element.DESCRI).fontSize(10);
        });
        pdf.pipe(fs.createWriteStream(`./temp/produtos${aleat}.pdf`));
        pdf.end();
        setTimeout(()=>{
            res.sendFile(path.join(__dirname, '..', 'temp', `produtos${aleat}.pdf`))
        }, 2000)
        setTimeout(()=>{
            fs.unlinkSync(`./temp/produtos${aleat}.pdf`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produto/:codigo", async(req, res)=>{
    try {
        res.json(await korpModel.product(req.params.codigo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produto/categoria/:categoria", async(req, res)=>{
    try {
        res.json(await korpModel.categoria(req.params.categoria));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produto/familia/:familia", async(req, res)=>{
    try {
        res.json(await korpModel.familia(req.params.familia));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produto/grupo/:grupo", async(req, res)=>{
    try {
        res.json(await korpModel.grupo(req.params.grupo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produto/subgrupo/:subgrupo", async(req, res)=>{
    try {
        res.json(await korpModel.subgrupo(req.params.subgrupo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produto/genero/:genero", async(req, res)=>{
    try {
        res.json(await korpModel.genero(req.params.genero));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/produto/tipo/:tipo", async(req, res)=>{
    try {
        res.json(await korpModel.tipo(req.params.tipo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/pedidos-de-compra/get_all", async(req, res)=>{
    try {
        res.json(await korpModel.allPedidosDeCompra())
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/pedidos-de-compra/pesquisa", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        res.json(await korpModel.searchPedidosDeCompra(req.query.codigo, resultados, req.query.rassoc));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/pedido-de-compra/:codigo", async(req, res)=>{
    try {
        res.json(await korpModel.pedidoDeCompra(req.params.codigo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/pedido-de-compra/obs1/:codigo", async(req, res)=>{
    try {
        res.json(await korpModel.uncryptObs(req.params.codigo));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;