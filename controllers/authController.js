const express = require("express");
const bcrypt = require('bcryptjs');
const Users = require('../models/usersModel');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post("/login", async(req, res)=>{
    try {
        const userPassword = await Users.passwordReturn(req.body.email);
        const userId = await Users.getUserJwt(req.body.email);
        if(bcrypt.compareSync(req.body.password, userPassword[0].password)){
            const token = jwt.sign({id: userId[0].id}, process.env.JWTSECRET, {expiresIn: 43200})
            res.send(token)
        }else{
            res.sendStatus(500)
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500) 
    }
})

router.get("/verify-jwt", async(req, res)=>{
    try {
        const autenticado = jwt.verify(req.headers.authorization.replace('jwt=', ''), process.env.JWTSECRET);
        if(autenticado){
            res.sendStatus(200)
        }else{
            res.sendStatus(401)
        }
    } catch (error) {
        console.log(error)
        res.sendStatus(500) 
    }
})

router.get("/logado", async(req, res)=>{
    try {
        function parseJwt (token) {
            return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        }
        const decoded = parseJwt(req.headers.authorization.replace('jwt=', ''))
        res.send(await Users.one(decoded.id))
        req.headers.authorization
    } catch (error) {
        console.log(error)
        res.sendStatus(500) 
    }
})

module.exports = router;