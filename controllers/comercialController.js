const express = require("express");
const comercialModel = require("../models/comercialModel");
const router = express.Router();
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const PDFKit = require('pdfkit');
const axios = require('axios');
const nodemailer = require('nodemailer');

router.get("/proposta-de-frete", async(req, res)=>{
    try {
        res.json(await comercialModel.all());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete-arquivadas", async(req, res)=>{
    try {
        res.json(await comercialModel.allArquivadas());
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

router.post("/arquiva-frete", async(req, res)=>{
    try {
        await comercialModel.arquivaFrete(req.body[0])
        res.sendStatus(200)
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
        res.json(await comercialModel.search(req.query.pedido, resultados, req.query.vendedor, req.query.identificador));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-de-frete-arquivadas/pesquisa", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        res.json(await comercialModel.searchArquivadas(req.query.pedido, resultados, req.query.vendedor, req.query.identificador));
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
        res.json(await comercialModel.searchSemRevisao(req.query.pedido, resultados, req.query.vendedor));
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

        let valorMaisImposto = req.body[0].valor

        if(req.body[1] == '0101001' || req.body[1] == '0101002'){
            valorMaisImposto *= 1.3
        }else{
            valorMaisImposto *= 1.2
        }

        await comercialModel.freteUpdate(req.body, req.params.id, today, valorMaisImposto);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sck/:numped/:filial", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SCK/get_all_id?idN=${req.params.numped}&filial=${req.params.filial}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data)
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.get("/clientes/:numped/:loja", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SA1/unico?id=${req.params.numped}&loja=${req.params.loja}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data)
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.post("/nova-proposta-de-frete/:numped/:cotador/:filial", async(req, res)=>{
    try {
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;

        let revisao = await comercialModel.revisaoCotacao(req.params.numped);
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SCJ/get_id?id=${req.params.numped}&empresa=${req.params.filial}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

        let valorTotal = 0.0
        let ipi = 0.0
        for(let i = 0; i < req.body.length; i++){
            let imposto = await axios.get(process.env.APITOTVS + `CONSULTA_SBZ/unico?filial=${req.params.filial}&cod=${req.body[i].produto}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
            if(imposto.data.objects[0].BZ_IPI != 0.0){
                ipi = (req.body[i].valor * imposto.data.objects[0].BZ_IPI) / 100
            }else{
                ipi = 0.0
            }
            valorTotal = valorTotal + (req.body[i].valor + ipi)
        };
        valorTotal.toFixed(2)

        //Necessário criar 3 cotações
        if(revisao.length == 0){
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, 1, response.data.cliente, valorTotal + response.data.xfreimp, req.params.filial, response.data.loja);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, 1, response.data.cliente, valorTotal + response.data.xfreimp, req.params.filial, response.data.loja);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, 1, response.data.cliente, valorTotal + response.data.xfreimp, req.params.filial, response.data.loja);
            for(let i = 0; i < req.body.length; i++){
                await comercialModel.novosItens(req.params.numped, req.body[i], 1);
            };
        }else{
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, parseInt(revisao[0].revisao) + 1, response.data.cliente, valorTotal + response.data.xfreimp, req.params.filial, response.data.loja);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, parseInt(revisao[0].revisao) + 1, response.data.cliente, valorTotal + response.data.xfreimp, req.params.filial, response.data.loja);
            await comercialModel.novaProposta(req.params.numped, req.params.cotador, today, parseInt(revisao[0].revisao) + 1, response.data.cliente, valorTotal + response.data.xfreimp, req.params.filial, response.data.loja);
            for(let i = 0; i < req.body.length; i++){
                await comercialModel.novosItens(req.params.numped, req.body[i], parseInt(revisao[0].revisao) + 1);
            };
        };

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/proposta-frete-itens/:numped/:revisao", async(req, res)=>{
    try {
        res.json(await comercialModel.freteItens(req.params.numped, req.params.revisao));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/transportadoras", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SA4/get_all", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects)
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.get("/transportadoras/:nome", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + "CONSULTA_SA4/get_all_like_nome?limit=20&pesquisa=" + req.params.nome, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get("/update-frete-cot", async(req, res)=>{
    try {
        await axios.put(process.env.APITOTVS + `CONSULTA_SCJ/update_cst?num=${req.query.cj_num}&fts=${req.query.cj_cst_fts}&valor=${req.query.valor}&transp=${req.query.transp}`,"", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        await comercialModel.preparaArquivaFrete(req.query.cj_num, req.query.revisao)
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sa1", async(req, res)=>{
    try {
        res.json(await comercialModel.sa1());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sa1/:cod", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SA1/get_id?id=${req.params.cod}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sa1-update", async(req, res)=>{
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
        await comercialModel.updateSa1(values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get("/sa1-pesquisa", async(req, res)=>{
    try {
        let resultados
        if(req.query.resultados == 'null' || req.query.resultados == undefined || req.query.resultados == '')
        {
            resultados = 1000
        }else{
            resultados = req.query.resultados
        }
        res.json(await comercialModel.searchSa1(req.query.codigo, req.query.nome, resultados));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/sa1/api/update", async(req, res)=>{
    try {
        await axios.put(process.env.APITOTVS + `updatesa1/update/sa1`, req.body, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}, Headers: {"tenantid": `01, 0101001, ailton souza, ${process.env.SENHAPITOTVS}`, "x-erp-module": "FAT"}});
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/sa1/api/update-local", async(req, res)=>{
    try {
        await comercialModel.sa1UpdateLocal(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sa3", async(req, res)=>{
    try {
        res.json(await comercialModel.sa3());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sa3/vendedor/:id", async(req, res)=>{
    try {
        res.json(await comercialModel.sa3Id(req.params.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sa3/update", async(req, res)=>{
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const hoje = dd + '/' + mm + '/' + yyyy;

        const periodo = await comercialModel.tableUpdate('sa3')
        await comercialModel.tableUpdateAtualiza('sa3', hoje)

        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/get_all?updated_at=${periodo[0].data}&limit=10000`,
        {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

        const tam_sa3 = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/get_all?limit=10000`,
        {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

        const tam_tabela = await comercialModel.tamanhoTabela()

        const diferencaTabelas = tam_sa3.data.meta.total - tam_tabela[0].contagem

        let values = [];
        response.data.objects.forEach(response => {
            values.push(
                {
                    "filial": response.filial,
                    "cod": response.cod,
                    "nome": response.nome,
                    "nreduz": response.nreduz,
                    "end": response.end,
                    "bairro": response.bairro,
                    "mun": response.mun,
                    "est": response.est,
                    "cep": response.cep,
                    "dddtel": response.dddtel,
                    "tel": response.tel,
                    "email": response.email,
                    "R_E_C_N_O_": response.R_E_C_N_O_,
                    "R_E_C_D_E_L_": response.R_E_C_D_E_L_
                }
            )
        });

        const limitArray = values.length - diferencaTabelas
        for (let i = 0; i < values.length; i ++){
            values.splice(0, limitArray)
        }

        // //insert de registros SOMENTE SE a tabela estiver vazia ou for adicionada uma nova coluna na tabela local
        // for(let i = 0; i < tam_sa3.data.objects.length; i++){
        //     await comercialModel.insertSa3(
        //         tam_sa3.data.objects[i].filial,
        //         tam_sa3.data.objects[i].cod, 
        //         tam_sa3.data.objects[i].nome,
        //         tam_sa3.data.objects[i].nreduz,
        //         tam_sa3.data.objects[i].end,
        //         tam_sa3.data.objects[i].bairro,
        //         tam_sa3.data.objects[i].mun,
        //         tam_sa3.data.objects[i].est,
        //         tam_sa3.data.objects[i].cep,
        //         tam_sa3.data.objects[i].dddtel,
        //         tam_sa3.data.objects[i].tel,
        //         tam_sa3.data.objects[i].email,
        //         tam_sa3.data.objects[i].R_E_C_N_O_,
        //         tam_sa3.data.objects[i].R_E_C_D_E_L_
        //     )
        // } 

        //insert de registros q não existem ainda
        if(diferencaTabelas != 0){
            for(let i = 0; i < values.length; i++){
                await comercialModel.insertSa3(
                    values[i].filial,
                    values[i].cod, 
                    values[i].nome,
                    values[i].nreduz,
                    values[i].end,
                    values[i].bairro,
                    values[i].mun,
                    values[i].est,
                    values[i].cep,
                    values[i].dddtel,
                    values[i].tel,
                    values[i].email,
                    values[i].R_E_C_N_O_,
                    values[i].R_E_C_D_E_L_
                )
            }
        }

        //update dos registros.
        for(let i = 0; i < response.data.objects.length; i++){
            await comercialModel.updateSa3(
                response.data.objects[i].filial,
                response.data.objects[i].cod, 
                response.data.objects[i].nome,
                response.data.objects[i].nreduz,
                response.data.objects[i].end,
                response.data.objects[i].bairro,
                response.data.objects[i].mun,
                response.data.objects[i].est,
                response.data.objects[i].cep,
                response.data.objects[i].dddtel,
                response.data.objects[i].tel,
                response.data.objects[i].email,
                response.data.objects[i].R_E_C_N_O_,
                response.data.objects[i].R_E_C_D_E_L_
            )
        }

        res.json(await comercialModel.sa3());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/sa3/api/update", async(req, res)=>{
    try {
        if(req.body.A3_CEP == '        ') req.body.A3_CEP = '82325200'
        await axios.put(process.env.APITOTVS + `CONSULTA_SA3/update`, req.body, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}, Headers: {"tenantid": `01, 0101001, ailton souza, ${process.env.SENHAPITOTVS}`, "x-erp-module": "FAT"}});
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/sa3/api/insert", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/get_cod`,
        {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        const a3CodAdd = (parseInt(response.data.objects[0].cod) + 1).toString().padStart(6, "0")
        const payload = {"A3_COD": a3CodAdd, "A3_NOME": req.body.A3_NOME};
        await axios.post(process.env.APITOTVS + `CONSULTA_SA3/insert`, payload, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}, Headers: {"tenantid": `01, 0101001, ailton souza, ${process.env.SENHAPITOTVS}`, "x-erp-module": "FAT"}});
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/sa3/api/delete", async(req, res)=>{
    try {
        await axios.delete(process.env.APITOTVS + `CONSULTA_SA3/delete`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}, Headers: {"tenantid": `01, 0101001, ailton souza, ${process.env.SENHAPITOTVS}`, "x-erp-module": "FAT"}, data: req.body});
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/sa3/pesquisa", async(req, res)=>{
    try {
        if(!req.query.codigo) req.query.codigo = '';
        if(!req.query.nome) req.query.nome = '';
        if(!req.query.email) req.query.email = '';
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/get_all?codigo=${req.query.codigo}&nome=${req.query.nome}&email=${req.query.email}&limit=10000`,
        {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.json(response.data.objects);
    } catch (error) {
        if(error.response.status = 404){
            res.json([]);
        }else{
            res.sendStatus(500);
        }
    }
});

router.get("/track_order/get_all", async(req, res)=>{
    try {
        const filterArray = (array, fields, value) => {
            fields = Array.isArray(fields) ? fields : [fields];
            return array.filter((item) => fields.some((field) => item[field] === value));
        };

        function formatDate (input) {
            let datePart = input.match(/\d+/g),
            year = datePart[0], // get only two digits
            month = datePart[1], day = datePart[2];
            
            return day+'/'+month+'/'+year;
        }

        function formatDateProtheus (input) {
            let datePart = input.match(/\d+/g),
            year = datePart[0], // get only two digits
            month = datePart[1], day = datePart[2];
            
            let data = year+month+day
            let dataString = String(data)
            return dataString;
        }
        
        let values = [];
        let sc5;
        let pcampo = '';
        let scampo = '';
        let pvalor = '';
        let svalor = '';

        if (req.query.pcampo){
            pcampo = req.query.pcampo
        };

        if (req.query.scampo){
            scampo = req.query.scampo
        };

        if (req.query.pvalor){
            pvalor = req.query.pvalor
        };

        if (req.query.svalor){
            svalor = req.query.svalor
        };

        if(!req.query.data_ent){
            sc5 = await axios.get(process.env.APITOTVS + `CONSULTA_SC5/get_track?limit=${req.query.limit}&pedido=${req.query.pedido}&data_ent=&vendedor=${req.query.vendedor}&filial=${req.query.filial}&pcampo=${pcampo}&scampo=${scampo}&pvalor=${pvalor}&svalor=${svalor}`,
            {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }else{
            sc5 = await axios.get(process.env.APITOTVS + `CONSULTA_SC5/get_track?limit=${req.query.limit}&pedido=${req.query.pedido}&data_ent=${formatDateProtheus(req.query.data_ent)}&vendedor=${req.query.vendedor}&filial=${req.query.filial}&pcampo=${pcampo}&scampo=${scampo}&pvalor=${pvalor}&svalor=${svalor}`,
            {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        }
 
        const sc6 = await axios.get(process.env.APITOTVS + `CONSULTA_SC6/get_track`,
        {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

        sc5.data.objects.forEach(response => {
            values.push({
                C5_LOJACLI: response.C5_LOJACLI,
                C5_FILIAL: response.C5_FILIAL,
                C5_NUM: response.C5_NUM,
                R_E_C_N_O_: response.R_E_C_N_O_,
                R_E_C_D_E_L_: response.R_E_C_D_E_L_,
                C5_XSEPCD: response.C5_XSEPCD,
                C5_XHSEPCD: response.C5_XHSEPCD,
                C5_XNSEPCD: response.C5_XNSEPCD,
                C5_XLIBCOM: response.C5_XLIBCOM,
                C5_XHLIBCO: response.C5_XHLIBCO,
                C5_XNLIBCO: response.C5_XNLIBCO,
                C5_XLIBFAT: response.C5_XLIBFAT,
                C5_XHLIBFA: response.C5_XHLIBFA,
                C5_XNLIBFA: response.C5_XNLIBFA,
                C5_XFATURD: response.C5_XFATURD,
                C5_XHFATUR: response.C5_XHFATUR,
                C5_XNFATUR: response.C5_XNFATUR,
                C5_XLIBEXP: response.C5_XLIBEXP,
                C5_XHLIBEX: response.C5_XHLIBEX,
                C5_XNLIBEX: response.C5_XNLIBEX,
                C5_XEXPEDI: response.C5_XEXPEDI,
                C5_XHEXPED: response.C5_XHEXPED,
                C5_XNEXPED: response.C5_XNEXPED,
                C5_CLIENTE: response.C5_CLIENTE,    
                C5_XPEDTR: response.C5_XPEDTR,  
                C5_VEND1: response.C5_VEND1,                           
                C5_FECENT: formatDate (response.C5_FECENT),
                itens: [
                ]
            })
        });

        values.forEach(element => {
            let filtrado = filterArray(sc6.data.objects, 'C6_NUM', element.C5_NUM)
            filtrado = filterArray(filtrado, 'C6_FILIAL', element.C5_FILIAL)
            element.itens.push(
                filtrado
            )
        });

        values = values.filter(item => item.R_E_C_D_E_L_ == 0)
        res.json(values);
    } catch (error) {
        console.log(error)
        if(error.response.status == 404){
            res.sendStatus(404);
        }else{
            res.sendStatus(500);
        }
    }
});

router.get("/track_order/update_c6xsepcd/:filial/:num/:item/:produto/:logado", async(req, res)=>{
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let minutes = today.getMinutes();
        let hour = today.getHours();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        if (minutes < 10) minutes = '0' + minutes;
        if (hour < 10) hour = '0' + hour;

        const hoje = dd + '/' + mm + '/' + yyyy;
        const hora = hour + ':' + minutes
        let horarioAtual = hoje + ' ' + hora
        await axios.put(process.env.APITOTVS + `CONSULTA_SC6/update_xsepcd?filial=${req.params.filial}&num=${req.params.num}&item=${req.params.item}&produto=${req.params.produto}&hora=${horarioAtual}&logado=${req.params.logado}`, '',
        {
            auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}, 
        });

        const listSepcd = await axios.get(process.env.APITOTVS + `CONSULTA_SC6/get_xsepcd?filial=${req.params.filial}&num=${req.params.num}`,
        {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

        let values = []
        listSepcd.data.objects.forEach(e => {
            values.push(e.C6_XSEPCD)
        });

        if(!values.includes(false)){
            await axios.put(process.env.APITOTVS + `CONSULTA_SC5/update_campo?filial=${req.params.filial}&num=${req.params.num}&campo=C5_XSEPCD&booleano=T&logado=${req.params.logado}&campo_logado=C5_XNSEPCD&hora=${horarioAtual}&campo_hora=C5_XHSEPCD`, '',
            {
                auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS},
            });

            if(req.query.vendedor.trim().length != 0){
                const vendedor = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/unico?codigo=${req.query.vendedor}`,
                {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

                const cliente = await axios.get(process.env.APITOTVS + `CONSULTA_SA1/get_id?id=${req.query.cliente}`,
                {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});

    
                const transporter = nodemailer.createTransport({
                    host: "outlook.maiex13.com.br",
                    port: 587,
                    auth: {
                      user: "suporte@fibracem.com",
                      pass: process.env.SUPORTEPASSWORD,
                    },
                  });

                let mailOptions = {
                    from: 'suporte@fibracem.com',
                    to: [`${vendedor.data.objects[0].A3_EMAIL}`],
                    subject: `Avisos Track Order.`,
                    text: `Pedido ${req.params.num} do cliente ${cliente.data.nome} da filial ${req.params.filial} foi separado no CD.`
                };
        
                transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }

        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/track_order/update_campo/:filial/:num/:campo/:booleano/:logado/:campologado/:campohora", async(req, res)=>{
    try {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let minutes = today.getMinutes();
        let hour = today.getHours();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        if (minutes < 10) minutes = '0' + minutes;
        if (hour < 10) hour = '0' + hour;

        const hoje = dd + '/' + mm + '/' + yyyy;
        const hora = hour + ':' + minutes
        let horarioAtual = hoje + ' ' + hora

        const response = await axios.put(process.env.APITOTVS + `CONSULTA_SC5/update_campo?filial=${req.params.filial}&num=${req.params.num}&campo=${req.params.campo}&booleano=${req.params.booleano}&logado=${req.params.logado}&campo_logado=${req.params.campologado}&hora=${horarioAtual}&campo_hora=${req.params.campohora}`,'',
        {
            auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS},
        });

        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;