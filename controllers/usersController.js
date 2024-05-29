const express = require("express");
const bcrypt = require('bcryptjs');
const Users = require('../models/usersModel')
const jwt = require('jsonwebtoken')

const router = express.Router();

router.get("/get_all", async(req, res)=>{
    try {
        res.send(await Users.all());
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.get("/get_all/inactive", async(req, res)=>{
    try {
        res.send(await Users.allInactives());
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.get("/:id", async(req, res)=>{
    try {
        res.send(await Users.one(req.params.id));
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.post("/register", async(req, res)=>{
    try {
        const existingUser = await Users.userRegisterConfirmation(req.body.email);
        if(existingUser.length != 0){
            res.status(401).send("User already exists");
        }else{
            const hashedPassword = bcrypt.hashSync(req.body.password)
            await Users.register(
                req.body.name,
                req.body.email,
                hashedPassword,
                req.body.admin,
                req.body.setor
            )
            res.sendStatus(200);
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.post("/alterPassword/:id", async(req, res)=>{
    try {
        const hashedPassword = bcrypt.hashSync(req.body._value)
        await Users.alterPassword(
            hashedPassword,
            req.params.id
        )
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.post("/alter/:id", async(req, res)=>{
    try {
        await Users.updateOne(
            req.body.name,
            req.body.email,
            req.body.admin,
            req.body.dpo,
            req.body.setor,
            req.body.intranet_id,
            req.body.intranet_department_id,
            req.body.intranet_setor_chamado,
            req.params.id
        )
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }
});

router.get("/inactivate/:id", async(req, res)=>{
    try {
        await Users.inactivateUser(req.params.id);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/reactivate/:id", async(req, res)=>{
    try {
        await Users.reactivateUser(req.params.id)
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/password-reset/:id", async(req, res)=>{
    try {
        const hashedPassword = bcrypt.hashSync('123456')
        await Users.passwordReset(hashedPassword, req.params.id)
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/buscar-por-setor/:setor", async(req, res)=>{
    try {
        res.send(await Users.setores(req.params.setor))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

module.exports = router;