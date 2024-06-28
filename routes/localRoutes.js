const express = require('express');
const router = express.Router();
const {atualizarScj, atualizarScjMassa} = require('../controllers/localController.js');
const {atualizarSd2, atualizarSd2Massa} = require('../controllers/locais/sd2Controller.js');
const {atualizarSck, atualizarSckMassa} = require('../controllers/locais/sckController.js');

router.get("/atualizar-scj", atualizarScj);
router.get("/atualizar-scj-massa", atualizarScjMassa);
router.get("/atualizar-scK", atualizarSck);
router.get("/atualizar-scK-massa", atualizarSckMassa);
router.get("/atualizar-sd2", atualizarSd2);
router.get("/atualizar-sd2-massa", atualizarSd2Massa);

module.exports = router;
