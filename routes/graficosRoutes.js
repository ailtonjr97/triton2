const express = require('express');
const router = express.Router();
const {orcQuantMes, orcQuantMesVend, pedQuantMes, pedQuantMesVend} = require('../controllers/graficosController.js');

router.get("/orcamentos-quantidade-mes", orcQuantMes);
router.get("/orcamentos-quantidade-mes-vend", orcQuantMesVend);

router.get("/pedidos-quantidade-mes", pedQuantMes);
router.get("/pedidos-quantidade-mes-vend", pedQuantMesVend);

module.exports = router;
