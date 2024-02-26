const express = require("express");
const Qualidade = require("../models/QualidadeModel")
const router = express.Router();
const multer = require('multer');
const path = require("path");

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

router.get("/documentos/ultimo-documento", async(req, res)=>{
    try {
        res.json(await Qualidade.ultimoDocumento())
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/anexos/:id", upload.single('file'), async(req, res)=>{
    try {
        await Qualidade.novoAnexo(req.file, req.params.id)
        await Qualidade.preencheAnexo(req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/documentos/anexos-lista/:id", async(req, res)=>{
    try {
        res.json(await Qualidade.listaAnexos(req.params.id))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarEdp/:id", async(req, res)=>{
    try {
        await Qualidade.edpUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/get_all", async(req, res)=>{
    try {
        res.send(await Qualidade.all())
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/documentos/inactive", async(req, res)=>{
    try {
        res.send(await Qualidade.inactiveDocuments());
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/inactive/:id", async(req, res)=>{
    try {
        res.send(await Qualidade.inactiveDocument(req.params.id));
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/:id", async(req, res)=>{
    try {
        res.send(await Qualidade.one(req.params.id))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/inspetores/:setor", async(req, res)=>{
    try {
        res.send(await Qualidade.inspetores(req.params.setor))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.post("/documentos/create", async(req, res)=>{
    try {
        await Qualidade.create(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarPcp/:id", async(req, res)=>{
    try {
        await Qualidade.pcpUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarProducao/:id", async(req, res)=>{
    try {
        await Qualidade.producaoUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarQualidade/:id", async(req, res)=>{
    try {
        await Qualidade.qualidadeUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarNc/:id", async(req, res)=>{
    try {
        await Qualidade.NcUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/inactivate/:id", async(req, res)=>{
    try {
        await Qualidade.inactivateDocument(req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})



module.exports = router;