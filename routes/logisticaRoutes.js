const express = require('express');
const router = express.Router();
const {produtosAll, produtoOne, inventario, armazem} = require('../controllers/logisticaController');
const { todosCotFrete, todosCotFreteItens } = require('../controllers/consultaController');

router.get("/produtos/all", produtosAll);
router.get("/produto", produtoOne);
router.get("/inventario", inventario);
router.get("/armazem-sbf", armazem);
router.get("/todos-cot-frete", todosCotFrete);
router.get("/todos-cot-frete-itens", todosCotFreteItens);

module.exports = router;
