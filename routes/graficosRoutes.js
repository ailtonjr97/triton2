const express = require('express');
const router = express.Router();
const {orcQuantMes, orcQuantMesVend} = require('../controllers/graficosController.js');

router.get("/orcamentos-quantidade-mes", orcQuantMes);
router.get("/orcamentos-quantidade-mes-vend", orcQuantMesVend);

module.exports = router;
