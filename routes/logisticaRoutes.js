const express = require('express');
const router = express.Router();
const {produtosAll, produtoOne} = require('../controllers/logisticaController');

router.get("/produtos/all", produtosAll);
router.get("/produto", produtoOne);

module.exports = router;
