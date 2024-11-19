const express = require('express');
const router = express.Router();
const {produtosAll, produtoOne, inventario, armazem} = require('../controllers/logisticaController');

router.get("/produtos/all", produtosAll);
router.get("/produto", produtoOne);
router.get("/inventario", inventario);
router.get("/armazem-sbf", armazem);

module.exports = router;
