const express = require("express");
const Rh = require("../models/rhModel")
const router = express.Router();
const multer = require('multer');
const path = require("path");
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './storage')
    },
    filename: function (req, file, cb) {
        const nome = file.originalname.replace(/\.[^/.]+$/, "")
        cb(null, nome + "-" + req.params.id + path.extname(file.originalname)) //Appending extension
    }
  })

const upload = multer({ storage: storage })

router.post("/documentos/anexos/:id", upload.single('file'), async(req, res)=>{
    try {
        await Rh.novoAnexo(req.file, req.params.id, req.body)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/anexos-lista/:id", async(req, res)=>{
    try {
        res.json(await Rh.listaAnexos(req.params.id))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/get_all", async(req, res)=>{
    try {
        res.json(await Rh.all())
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.post("/documentos/create", async(req, res)=>{
    try {
        await Rh.create(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.post("/documentos/editar-entidade/:id", async(req, res)=>{
    try {
        await Rh.edit(req.body, req.params.id);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/documentos/entidade/:id", async(req, res)=>{
    try {
        res.json(await Rh.entidade(req.params.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/documentos/inactive", async(req, res)=>{
    try {
        res.json(await Rh.inactive());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/documentos/inativar-entidade/:id", async(req, res)=>{
    try {
        await Rh.inactivate(req.params.id);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/documentos/ativar-entidade/:id", async(req, res)=>{
    try {
        await Rh.activate(req.params.id);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/documentos/email/:email/:documento", async(req, res)=>{
    try {
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
            to: [req.params.email],
            subject: 'Envio de documento',
            text: `Favor clicar no link para envio dos seguintes documentos: ${req.params.documento}`
        };

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                res.sendStatus(500);
                console.log(err);
            } else {
                res.sendStatus(200);
            }
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;