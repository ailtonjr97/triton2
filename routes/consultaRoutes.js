const express = require('express');
const router = express.Router();
const {consultaCassia, sb2GetAll, sb8GetAll, sbfGetAll} = require('../controllers/consultaController');

router.get("/consulta-cassia", consultaCassia);
router.get("/sb2-get-all", sb2GetAll);
router.get("/sb8-get-all", sb8GetAll);
router.get("/sbf-get-all", sbfGetAll);

module.exports = router;
