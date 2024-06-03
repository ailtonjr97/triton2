const express = require('express');
const router = express.Router();
const { 
    analiseDeCredito, 
    atualizaPropostaDeFrete, 
    documento, 
    vendedor, 
    sendDocumentRequestEmail, 
    docOk,
    credFinaliza,
    arquivar,
    analiseDeCreditoArquivadas,
    parcelas,
    nfcte
} = require('../controllers/financeiroController');

router.get("/analise-de-credito", analiseDeCredito);
router.get("/analise-de-credito-arquivadas", analiseDeCreditoArquivadas);
router.get("/atualiza-proposta-de-frete", atualizaPropostaDeFrete);
router.get("/documento", documento);
router.get("/vendedor", vendedor);
router.get("/email", sendDocumentRequestEmail);
router.get("/docok", docOk);
router.get("/parcelas", parcelas);
router.post("/cred-finaliza", credFinaliza);
router.post("/arquivar", arquivar);
router.get("/nfcte", nfcte);

module.exports = router;
