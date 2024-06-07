const express = require('express');
const router = express.Router();
const {consultaCassia, sb2GetAll, sb8GetAll, sbfGetAll} = require('../controllers/consultaController');
const { 
    cliente,
    vendedor,
    condicaoDePagamento,
    tabelaDePreco
} = require('../controllers/consultasController.js');

router.get("/consulta-cassia", consultaCassia);
router.get("/sb2-get-all", sb2GetAll);
router.get("/sb8-get-all", sb8GetAll);
router.get("/sbf-get-all", sbfGetAll);

router.get("/cliente", cliente);
router.get("/vendedor", vendedor);
router.get("/cond-pag", condicaoDePagamento);
router.get("/tab-preco", tabelaDePreco);
module.exports = router;
