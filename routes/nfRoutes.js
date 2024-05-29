const express = require('express');
const router = express.Router();
const { 
nota,
itens
} = require('../controllers/nfController');

router.get("/nota", nota);
router.get("/itens", itens);

module.exports = router;
