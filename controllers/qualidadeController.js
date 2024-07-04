const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require("path");
const qualidadeModel = require("../models/QualidadeModel")

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
        const resp = await qualidadeModel.ultimoDocumento();
        res.json(resp[0])
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/anexos/:id", upload.single('file'), async(req, res)=>{
    try {
        await qualidadeModel.novoAnexo(req.file, req.params.id)
        await qualidadeModel.preencheAnexo(req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/documentos/anexos-lista/:id", async(req, res)=>{
    try {
        res.json(await qualidadeModel.listaAnexos(req.params.id))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarEdp/:id", async(req, res)=>{
    try {
        await qualidadeModel.edpUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/get_all", async(req, res)=>{
    try {
        const resp = await qualidadeModel.all();
        res.send(resp);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/documentos/inactive", async(req, res)=>{
    try {
        res.send(await qualidadeModel.inactiveDocuments());
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
        res.send(await qualidadeModel.one(req.params.id))
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/inspetores", async(req, res)=>{
    try {
        const resp = await qualidadeModel.inspetores(req.query.setor);
        res.send(resp)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/documentos/create", async(req, res)=>{
    try {
        await qualidadeModel.create(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post("/documentos/editarPcp/:id", async(req, res)=>{
    try {
        await qualidadeModel.pcpUpdate(req.body, req.params.id)
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