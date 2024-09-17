const express = require('express');
const router = express.Router();
const {orcQuantMes} = require('../controllers/graficosController.js');

router.get("/orcamentos-quantidade-mes", orcQuantMes);

module.exports = router;
