const express = require('express');
const router = express.Router();
const {consultaCassia} = require('../controllers/consultaController');

router.get("/consulta-cassia", consultaCassia);

module.exports = router;
