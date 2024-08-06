const express = require('express');
const router = express.Router();
const {consultaCassia, sb2GetAll, sb8GetAll, sbfGetAll, consultaAmandinha, consultaHerica} = require('../controllers/consultaController');
const { cliente, vendedor, condicaoDePagamento, tabelaDePreco, transportadora} = require('../controllers/consultasController.js');

router.get("/consulta-cassia", consultaCassia);
router.get("/consulta-amandinha", consultaAmandinha);
router.get("/sb2-get-all", sb2GetAll);
router.get("/sb8-get-all", sb8GetAll);
router.get("/sbf-get-all", sbfGetAll);
router.get("/consulta-herica", consultaHerica);

router.get("/cliente", cliente);
router.get("/vendedor", vendedor);
router.get("/transportadora", transportadora);
router.get("/cond-pag", condicaoDePagamento);
router.get("/tab-preco", tabelaDePreco);
module.exports = router;
