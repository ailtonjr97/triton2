const express = require("express");
const engenhariaModel = require("../models/engenhariaModel")
const router = express.Router();
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const PDFKit = require('pdfkit');

router.get("/moldes", async(req, res)=>{
    try {
        res.json(await engenhariaModel.all())
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/moldes/pesquisa", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        res.json(await engenhariaModel.search(req.query.codigo, resultados, req.query.descricao));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/moldes/excel", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        const response = await engenhariaModel.search(req.query.codigo, resultados, req.query.descricao);
        const workSheet = XLSX.utils.json_to_sheet(response);
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "moldes");
        const aleat = Math.round(Math.random() * 1000)
        XLSX.writeFile(workBook, `./temp/moldes${aleat}.xlsx`);
        res.sendFile(path.join(__dirname, '..', 'temp', `moldes${aleat}.xlsx`))
        setTimeout(()=>{
            fs.unlinkSync(`./temp/moldes${aleat}.xlsx`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/moldes/pdf", async(req, res)=>{
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
        const response = await engenhariaModel.search(req.query.codigo, resultados, req.query.descricao);
        pdf.text("Moldes: ")
        response.forEach(element => {
            pdf.text(element.CODIGO + " - " + element.DESCRICAO).fontSize(10);
        });
        pdf.pipe(fs.createWriteStream(`./temp/moldes${aleat}.pdf`));
        pdf.end();
        setTimeout(()=>{
            res.sendFile(path.join(__dirname, '..', 'temp', `moldes${aleat}.pdf`))
        }, 2000)
        setTimeout(()=>{
            fs.unlinkSync(`./temp/moldes${aleat}.pdf`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/moldes/:id", async(req, res)=>{
    try {
        res.json(await engenhariaModel.molde(req.params.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;