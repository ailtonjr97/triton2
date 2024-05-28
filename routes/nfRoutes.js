const express = require('express');
const router = express.Router();
const { 
nota
} = require('../controllers/nfController');

router.get("/nota", nota);


module.exports = router;
