const express = require('express');
const router = express.Router();
const {produtosAll, produtoOne, inventario} = require('../controllers/logisticaController');

router.get("/produtos/all", produtosAll);
router.get("/produto", produtoOne);
router.get("/inventario", inventario);

module.exports = router;
