const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require("path");
const qualidadeModel   = require("../models/QualidadeModel");
const qualidadeModelMs = require("../models/qualidadeModelMs");
const { sendEmail } = require('../services/emailService');
const Users = require('../models/usersModel');

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
        cb(null, './storage');
    },
    filename: function (req, file, cb) {
        // Corrige a codificação do originalname
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

        const originalName = file.originalname;
        const extension = path.extname(originalName);
        const nome = path.basename(originalName, extension);
        const numeroAleatorio = Math.floor(Math.random() * 90) + 10; // Gera um número entre 10 e 99
        cb(null, `${nome}-${numeroAleatorio}${extension}`);
    }
});

const storage3 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './storage');
    },
    filename: function (req, file, cb) {
        // Converte o nome do arquivo para UTF-8 a partir de latin1
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const numeroAleatorio = Math.floor(Math.random() * 90) + 10; // Gera um número entre 10 e 99
        const nome = file.originalname.replace(/\.[^/.]+$/, "");
        cb(null, nome + "-" + numeroAleatorio + path.extname(file.originalname));
    }
});



const upload = multer({ storage: storage })
const upload2 = multer({ storage: storage2 })
const upload3 = multer({ storage: storage3 })

router.get("/anexos-home", async(req, res)=>{
    try {
        const resp = await qualidadeModelMs.anexosHome();
        res.json(resp);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/anexos-home/:id", async(req, res)=>{
    try {
        const {id} = req.params
        const resp = await qualidadeModelMs.anexosHomeUnico(id);
        res.json(resp);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.delete("/anexos-home/:id", async(req, res)=>{
    try {
        const {id} = req.params
        const resp = await qualidadeModelMs.anexosHomeDelete(id);
        res.json(resp);
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
            QUALIDADE_PREENCHIDO:   e.QUALIDADE_PREENCHIDO,
            COD_PROD:               e.COD_PROD,
            LINHA_PRODUTIVA:        e.LINHA_PRODUTIVA
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
});

router.get("/documentos/email-setor/:setor/:id", async(req, res)=>{
    try {
        const usuarios = await Users.setoresAtivos(req.params.setor);
        usuarios.forEach(async element => {
            await sendEmail(element.email, "Minuta de Retrabalho", `Há uma nova minuta de retrabalho de ID ${req.params.id} para o seu setor preencher.`);
        });
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.get("/propriedades", async(req, res)=>{
    try {
        res.json(await qualidadeModel.propriedades());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/propriedades/checklist/:id", async (req, res) => {
    try {
        if (req.body.no_dia) {
            const [diaNoDia, mesNoDia, anoNoDia] = req.body.no_dia.split("/");
            req.body.no_dia = `${anoNoDia}-${mesNoDia}-${diaNoDia}`;
        }

        if (req.body.data_chegada) {
            const [diaChegada, mesChegada, anoChegada] = req.body.data_chegada.split("/");
            req.body.data_chegada = `${anoChegada}-${mesChegada}-${diaChegada}`;
        }

        if (req.body.data_saida) {
            const [diaSaida, mesSaida, anoSaida] = req.body.data_saida.split("/");
            req.body.data_saida = `${anoSaida}-${mesSaida}-${diaSaida}`;
        }

        await qualidadeModel.checklistPropriedadeProduto(req.params.id, req.body);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


router.get("/propriedades/arquivados", async(req, res)=>{
    try {
        res.json(await qualidadeModel.propriedadesArquivados());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/propriedades-produtos/:id", async(req, res)=>{
    try {
        res.json(await qualidadeModel.propriedadesProdutos(req.params.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/propriedade/:id", async(req, res)=>{
    try {
        res.json(await qualidadeModel.propriedade(req.params.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/propriedades", async(req, res)=>{
    try {
        const produtos = req.body.produtos
        const response = await qualidadeModel.insertPropriedade(req.body);

        produtos.forEach(async e => {
            await qualidadeModel.insertPropriedadeProduto(e, response.recordset[0].id);
        });

        if(req.body.mot_dev == 'DEVOLUÇÃO DE RECLAMAÇÃO'){
            await sendEmail(
                'sup.qualidade@fibracem.com',
                'Propriedade do Cliente',
                `Você tem uma nova propriedade do cliente para responder. ID: ${response.recordset[0].id}. http://aplicacao.fibracem.com:8080/qualidade/propriedade-do-cliente`
            );
        }else{
            await sendEmail(
                ['vendas1@fibracem.com', 'sup.vendas@fibracem.com'],
                'Propriedade do Cliente',
                `Você tem uma nova propriedade do cliente para responder. ID: ${response.recordset[0].id}. http://aplicacao.fibracem.com:8080/qualidade/propriedade-do-cliente`
            );
        };

        res.json({'id': response.recordset[0].id});
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/propriedades-arquivo", upload3.array('files', 10), async(req, res)=>{
    try {
        // req.files será um array de arquivos
        for (const file of req.files) {
            // Aqui, req.body.id conterá o id enviado pelo FormData
            await qualidadeModel.novoAnexoPropriedades(file, req.body.id);
        }
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/propriedades-arquivo/:id", async(req, res)=>{
    try {
        res.json(await qualidadeModel.buscarAnexoPropriedades(req.params.id));
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
});

router.post("/propriedade/status", async(req, res)=>{
    try {
        await qualidadeModel.statusPropriedadeProduto(req.body.id, req.body.status, req.body.arquiva)
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post("/propriedade/arquivar", async(req, res)=>{
    try {
        await qualidadeModel.arquivarPropriedadeProduto(req.body.id)
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});



module.exports = router;