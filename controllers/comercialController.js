const express = require("express");
const comercialModel = require("../models/comercialModel");
const ApisTotvs = require("../models/apisTotvsModel");
const router = express.Router();
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const PDFKit = require('pdfkit');
const axios = require('axios');

router.get("/proposta-de-frete", async(req, res)=>{
    try {
        res.json(await comercialModel.all());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete-semrev", async(req, res)=>{
    try {
        res.json(await comercialModel.allSemRevisao());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete/pesquisa", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        res.json(await comercialModel.search(req.query.pedido, resultados));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete-semrev/pesquisa", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        res.json(await comercialModel.searchSemRevisao(req.query.pedido, resultados));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete/excel", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        const response = await comercialModel.search(req.query.pedido, resultados);
        const workSheet = XLSX.utils.json_to_sheet(response);
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "cotacoes");
        const aleat = Math.round(Math.random() * 1000)
        XLSX.writeFile(workBook, `./temp/cotacoes${aleat}.xlsx`);
        res.sendFile(path.join(__dirname, '..', 'temp', `cotacoes${aleat}.xlsx`))
        setTimeout(()=>{
            fs.unlinkSync(`./temp/cotacoes${aleat}.xlsx`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete-semrev/excel", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        const response = await comercialModel.searchSemRevisao(req.query.pedido, resultados);
        const workSheet = XLSX.utils.json_to_sheet(response);
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "cotacoes");
        const aleat = Math.round(Math.random() * 1000)
        XLSX.writeFile(workBook, `./temp/cotacoes${aleat}.xlsx`);
        res.sendFile(path.join(__dirname, '..', 'temp', `cotacoes${aleat}.xlsx`))
        setTimeout(()=>{
            fs.unlinkSync(`./temp/cotacoes${aleat}.xlsx`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete/pdf", async(req, res)=>{
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
        const response = await comercialModel.search(req.query.pedido, resultados);
        pdf.text("Cotacoes: ")
        response.forEach(element => {
            pdf.text('ID: ' + element.id).fontSize(10);
            pdf.text('Pedido: ' + element.pedido).fontSize(10);
            pdf.text('Vendedor: ' + element.vendedor).fontSize(10);
            pdf.text('Status: ' + element.status).fontSize(10);
            pdf.text('Data Solicitação: ' + element.data_solicit).fontSize(10);
            pdf.text('Data Resposta: ' + element.data_resp).fontSize(10);
            pdf.text('Revisão: ' + element.revisao).fontSize(10);
            pdf.text('Valor: ' + element.valor).fontSize(10);
            pdf.text('Transportadora: ' + element.nome_transportadora).fontSize(10);
            pdf.text('Prazo: ' + element.prazo).fontSize(10);
            pdf.text('Cotador: ' + element.cotador).fontSize(10);

            pdf.moveDown();
        });
        pdf.pipe(fs.createWriteStream(`./temp/cotacoes${aleat}.pdf`));
        pdf.end();
        setTimeout(()=>{
            res.sendFile(path.join(__dirname, '..', 'temp', `cotacoes${aleat}.pdf`))
        }, 2000)
        setTimeout(()=>{
            fs.unlinkSync(`./temp/cotacoes${aleat}.pdf`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete-semrev/pdf", async(req, res)=>{
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
        const response = await comercialModel.searchSemRevisao(req.query.pedido, resultados);
        pdf.text("Cotacoes: ")
        response.forEach(element => {
            pdf.text('ID: ' + element.id).fontSize(10);
            pdf.text('Pedido: ' + element.pedido).fontSize(10);
            pdf.text('Vendedor: ' + element.vendedor).fontSize(10);
            pdf.text('Status: ' + element.status).fontSize(10);
            pdf.text('Data Solicitação: ' + element.data_solicit).fontSize(10);
            pdf.text('Data Resposta: ' + element.data_resp).fontSize(10);
            pdf.text('Revisão: ' + element.revisao).fontSize(10);
            pdf.text('Valor: ' + element.valor).fontSize(10);
            pdf.text('Transportadora: ' + element.nome_transportadora).fontSize(10);
            pdf.text('Prazo: ' + element.prazo).fontSize(10);
            pdf.text('Cotador: ' + element.cotador).fontSize(10);

            pdf.moveDown();
        });
        pdf.pipe(fs.createWriteStream(`./temp/cotacoes${aleat}.pdf`));
        pdf.end();
        setTimeout(()=>{
            res.sendFile(path.join(__dirname, '..', 'temp', `cotacoes${aleat}.pdf`))
        }, 2000)
        setTimeout(()=>{
            fs.unlinkSync(`./temp/cotacoes${aleat}.pdf`);
        }, 8000)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete/:id", async(req, res)=>{
    try {
        res.json(await comercialModel.proposta(req.params.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/proposta-de-frete/:id", async(req, res)=>{
    try {
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;

        await comercialModel.freteUpdate(req.body, req.params.id, today);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sck/:numped", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SCK_2/get_all_id?idN=" + req.params.numped, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data)
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get("/clientes/:numped", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SA1/get_id?id=" + req.params.numped, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data)
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post("/nova-proposta-de-frete/:numped/:cotador", async(req, res)=>{
    try {
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;

        let revisao = await comercialModel.revisaoCotacao(req.params.numped);
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SCJ/get_id?id=" + req.params.numped, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

        let valorTotal = 0.0
        for(let i = 0; i < req.body.length; i++){
            valorTotal = valorTotal + req.body[i].valor
        };

        //Necessário criar 3 cotações
        if(revisao.length == 0){
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, 1, response.data.cliente, valorTotal + response.data.xfreimp);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, 1, response.data.cliente, valorTotal + response.data.xfreimp);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, 1, response.data.cliente, valorTotal + response.data.xfreimp);
            for(let i = 0; i < req.body.length; i++){
                await comercialModel.novosItens(req.params.numped, req.body[i]);
            };
        }else{
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, parseInt(revisao[0].revisao) + 1, response.data.cliente, valorTotal + response.data.xfreimp);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, parseInt(revisao[0].revisao) + 1, response.data.cliente, valorTotal + response.data.xfreimp);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, parseInt(revisao[0].revisao) + 1, response.data.cliente, valorTotal + response.data.xfreimp);
        };

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-frete-itens/:numped", async(req, res)=>{
    try {
        res.json(await comercialModel.freteItens(req.params.numped));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/transportadoras", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SA4/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data.objects)
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.get("/transportadoras/:nome", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SA4/get_all_like_nome?limit=20&pesquisa=" + req.params.nome, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data.objects)
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;