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
    nfcte,
    nfcteEntrada,
    trocaResp,
    gridCte,
    refreshCte,
    arquivaCte,
    pdfNf,
    roboBusca,
    guiaNf,
    marcarGuia
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
router.get("/nfcte-entrada", nfcteEntrada);
router.get("/troca_resp", trocaResp);
router.get("/grid", gridCte);
router.get("/refresh-cte", refreshCte);
router.put("/arquiva-cte", arquivaCte);
router.get("/pdf-nf", pdfNf);
router.get("/robo-busca", roboBusca);
router.get("/guia-nf", guiaNf);
router.post("/marcar-box", marcarGuia);

module.exports = router;
