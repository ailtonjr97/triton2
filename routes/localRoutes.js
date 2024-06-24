const express = require('express');
const router = express.Router();
const {atualizarScj, atualizarScjMassa} = require('../controllers/localController.js');

router.get("/atualizar-scj", atualizarScj);
router.get("/atualizar-scj-massa", atualizarScjMassa);

module.exports = router;
