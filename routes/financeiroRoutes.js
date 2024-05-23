const express = require('express');
const router = express.Router();
const { 
    analiseDeCredito, 
    atualizaPropostaDeFrete, 
    documento, 
    vendedor, 
    sendDocumentRequestEmail, 
    docOk,
    credFinaliza
} = require('../controllers/financeiroController');

router.get("/analise-de-credito", analiseDeCredito);
router.get("/atualiza-proposta-de-frete", atualizaPropostaDeFrete);
router.get("/documento", documento);
router.get("/vendedor", vendedor);
router.get("/email", sendDocumentRequestEmail);
router.get("/docok", docOk);
router.post("/cred-finaliza", credFinaliza);

module.exports = router;
