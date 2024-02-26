const express = require("express");
const Chamados = require("../models/ChamadosModel")
const router = express.Router();

router.get("/get_all/:setor/:designado", async(req, res)=>{
    try {
        res.json(await Chamados.all(req.params.setor, req.params.designado))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/get_one/:id", async(req, res)=>{
    try {
        res.json(await Chamados.one(req.params.id))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.post("/update/:id", async(req, res)=>{
    try {
        if(req.body.definicao == ''){
            await Chamados.update(req.body, req.params.id);   
        }else{
            await Chamados.fechar(req.body, req.params.id);
        }
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/requisitante", async(req, res)=>{
    try {
        res.send(await Chamados.requisitante());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/designado/:id", async(req, res)=>{
    try {
        res.json(await Chamados.designado(req.params.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/setores", async(req, res)=>{
    try {
        res.json(await Chamados.setores());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/areas/:setor_chamado", async(req, res)=>{
    try {
        res.json(await Chamados.areas(req.params.setor_chamado));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/tipos/:area_id", async(req, res)=>{
    try {
        res.json(await Chamados.tipos(req.params.area_id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/urgencias", async(req, res)=>{
    try {
        res.json(await Chamados.urgencias());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/chat/:chamado_id", async(req, res)=>{
    try {
        res.json(await Chamados.chat(req.params.chamado_id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;