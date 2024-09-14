const express = require('express');
const router = express.Router();
const { cliente, vendedor, condicaoDePagamento, tabelaDePreco, transportadora} = require('../controllers/consultasController.js');
const {
        consultaCassia,
        sb2GetAll,
        sb8GetAll,
        sbfGetAll,
        consultaAmandinha,
        consultaHerica,
        consultaMichelleAlguns,
        consultaMichelleTudo,
        consultaSolicitacoesDeCompra,
        consultaDa0010,
        consultaDa1010,
        consultaUniaoDa0Da1,
        //consultaHistlise,
        consultaSb1,
        consultaCotFrete,
        consultaAnaliseCreditoLuiz,
        consultaChamadosManutInd,
        consultaStatusChamados,
        consultaUrgenciasChamados,
        consultaAreasChamados,
        consultaOperacoesChamados,
        consultaAllUsers,
        consultaAllEmpresas,
        consultaAllTipoManuts,
        consultaAllSubTipoManuts,
        consultaAllCentroCusto
    } = require('../controllers/consultaController');

router.get("/consulta-cassia", consultaCassia);
router.get("/consulta-amandinha", consultaAmandinha);
router.get("/sb2-get-all", sb2GetAll);
router.get("/sb8-get-all", sb8GetAll);
router.get("/sbf-get-all", sbfGetAll);
router.get("/consulta-herica", consultaHerica);
router.get("/consulta-michelle-tudo", consultaMichelleTudo);
router.get("/consulta-michelle-alguns", consultaMichelleAlguns);
router.get("/consulta-solicit-compras", consultaSolicitacoesDeCompra);
router.get("/consulta-da0010", consultaDa0010);
router.get("/consulta-da1010", consultaDa1010);
router.get("/consulta-cot-frete", consultaCotFrete);
router.get("/consulta-analise-credito-fibra", consultaAnaliseCreditoLuiz);
router.get("/consulta-chamados-manut-ind", consultaChamadosManutInd);
router.get("/consulta-chamados-status", consultaStatusChamados);
router.get("/consulta-chamados-urgencias", consultaUrgenciasChamados);
router.get("/consulta-chamados-areas", consultaAreasChamados);
router.get("/consulta-chamados-operacoes", consultaOperacoesChamados);
router.get("/consulta-chamados-usuarios", consultaAllUsers);
router.get("/consulta-chamados-empresas", consultaAllEmpresas);
router.get("/consulta-chamados-tipo-manuts", consultaAllTipoManuts);
router.get("/consulta-chamados-sub-tipo-manuts", consultaAllSubTipoManuts);
router.get("/consulta-chamados-centro-custo", consultaAllCentroCusto);
//router.get("/consulta-histlise", consultaHistlise);
router.get("/consulta-sb1", consultaSb1);

router.get("/cliente", cliente);
router.get("/vendedor", vendedor);
router.get("/transportadora", transportadora);
router.get("/cond-pag", condicaoDePagamento);
router.get("/tab-preco", tabelaDePreco);
module.exports = router;
