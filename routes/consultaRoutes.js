const express = require('express');
const router = express.Router();
const { cliente, vendedor, condicaoDePagamento, tabelaDePreco, transportadora} = require('../controllers/consultasController.js');
const {
        consultaCassia,
        sb2GetAll,
        sb8GetAll,
        sbfGetAll,
        consultaAmandinha,
        consultaHerica,
        consultaMichelleAlguns,
        consultaMichelleTudo,
        consultaSolicitacoesDeCompra,
        consultaDa0010,
        consultaDa1010,
        consultaUniaoDa0Da1
    } = require('../controllers/consultaController');

router.get("/consulta-cassia", consultaCassia);
router.get("/consulta-amandinha", consultaAmandinha);
router.get("/sb2-get-all", sb2GetAll);
router.get("/sb8-get-all", sb8GetAll);
router.get("/sbf-get-all", sbfGetAll);
router.get("/consulta-herica", consultaHerica);
router.get("/consulta-michelle-tudo", consultaMichelleTudo);
router.get("/consulta-michelle-alguns", consultaMichelleAlguns);
router.get("/consulta-solicit-compras", consultaSolicitacoesDeCompra);
router.get("/consulta-da0010", consultaDa0010);
router.get("/consulta-da1010", consultaDa1010);

router.get("/consulta-uniao-da0-da1", consultaUniaoDa0Da1);

router.get("/cliente", cliente);
router.get("/vendedor", vendedor);
router.get("/transportadora", transportadora);
router.get("/cond-pag", condicaoDePagamento);
router.get("/tab-preco", tabelaDePreco);
module.exports = router;
