const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require("path");
const qualidadeModel   = require("../models/QualidadeModel")
const qualidadeModelMs = require("../models/qualidadeModelMs")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './storage')
    },
    filename: function (req, file, cb) {
        const nome = file.originalname.replace(/\.[^/.]+$/, "")
        cb(null, nome + "-" + req.params.id + path.extname(file.originalname)) //Appending extension
    }
})

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './storage')
    },
    filename: function (req, file, cb) {
        const nome = file.originalname.replace(/\.[^/.]+$/, "")
        const numeroAleatorio = Math.floor(Math.random() * 90) + 10; // Gera um número entre 10 e 99
        cb(null, `${nome}-${numeroAleatorio}${path.extname(file.originalname)}`) // Anexa a extensão
    }
})


const upload = multer({ storage: storage })
const upload2 = multer({ storage: storage2 })

router.get("/anexos-home", async(req, res)=>{
    try {
        const resp = await qualidadeModelMs.anexosHome();
        res.json(resp.recordset);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/anexos-home/:id", async(req, res)=>{
    try {
        const {id} = req.params
        const resp = await qualidadeModelMs.anexosHomeUnico(id);
        res.json(resp.recordset);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.delete("/anexos-home/:id", async(req, res)=>{
    try {
        const {id} = req.params
        const resp = await qualidadeModelMs.anexosHomeDelete(id);
        res.json(resp.recordset);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.post("/anexos-home-arquivo", upload2.single('file'), async(req, res)=>{
    try {
        const {fieldname, originalname, encoding, mimetype, destination, filename, path, size} = req.file;
        const {categoria} = req.body;
        await qualidadeModelMs.anexosHomePost(fieldname, originalname, encoding, mimetype, destination, filename, path, size, categoria);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

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

        function formatDate(dateString) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }

        const resposta = resp.map(e =>({
            ID:                     e.ID,
            TIPO_DOC:               e.TIPO_DOC,
            DATA:                   formatDate(e.DATA),
            INSPETOR:               e.INSPETOR,
            EDP_PREENCHIDO:         e.EDP_PREENCHIDO,
            PCP_PREENCHIDO:         e.PCP_PREENCHIDO,
            PRODUCAO_PREENCHIDO:    e.PRODUCAO_PREENCHIDO,
            MOTIVO_NC_PREENCHIDO:   e.MOTIVO_NC_PREENCHIDO,
            QUALIDADE_PREENCHIDO:   e.QUALIDADE_PREENCHIDO
        }))

        res.send(resposta);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/documentos/inactive", async(req, res)=>{
    try {
        const resp = await qualidadeModel.inactiveDocuments()

        function formatDate(dateString) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }

        const resposta = resp.map(e =>({
            ID:                     e.ID,
            TIPO_DOC:               e.TIPO_DOC,
            DATA:                   formatDate(e.DATA),
            INSPETOR:               e.INSPETOR,
            EDP_PREENCHIDO:         e.EDP_PREENCHIDO,
            PCP_PREENCHIDO:         e.PCP_PREENCHIDO,
            PRODUCAO_PREENCHIDO:    e.PRODUCAO_PREENCHIDO,
            MOTIVO_NC_PREENCHIDO:   e.MOTIVO_NC_PREENCHIDO,
            QUALIDADE_PREENCHIDO:   e.QUALIDADE_PREENCHIDO
        }))

        res.send(resposta);
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
        await qualidadeModel.producaoUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarQualidade/:id", async(req, res)=>{
    try {
        await qualidadeModel.qualidadeUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.post("/documentos/editarNc/:id", async(req, res)=>{
    try {
        await qualidadeModel.ncUpdate(req.body, req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

router.get("/documentos/inactivate/:id", async(req, res)=>{
    try {
        await qualidadeModel.inactivateDocument(req.params.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})



module.exports = router;