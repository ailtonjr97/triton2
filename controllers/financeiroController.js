const financeiroModel = require('../models/financeiroModel');
const axios = require('axios');
const { formatDateToMySQL, formatCurrentDateTimeForMySQL, sqlServerDateTimeToString } = require('../utils/dateUtils');
const { sendEmail } = require('../services/emailService');
const { sendEmailCadastro } = require('../services/emailServiceCadastro');
const { formatarParaMoedaBrasileira } = require('../utils/formatarParaMoedaBrasileira');
const { adicionarHorasUteis } = require('../utils/businessHours');
const fs = require('fs').promises;
const xml2js = require('xml2js');
const Client = require('ssh2-sftp-client');
const {formatCurrency} = require('../utils/protheus');
const path = require('path');
const puppeteer = require('puppeteer');

async function analiseDeCredito(req, res) {
    try {
        const orcamento = req.query.orcamento ? req.query.orcamento : '';
        const cliente = req.query.cliente ? req.query.cliente : '';

        res.json(await financeiroModel.analiseDeCredito(orcamento, cliente));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function analiseDeCreditoArquivadas(req, res) {
    try {
        const orcamento = req.query.orcamento ? req.query.orcamento : '';
        const cliente = req.query.cliente ? req.query.cliente : '';

        res.json(await financeiroModel.analiseDeCreditoArquivadas(orcamento, cliente));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function atualizaPropostaDeFrete(req, res) {
    try {
        const mysql = require('mysql2/promise');
        let jsonData = await axios.get(process.env.APITOTVS + "CONSULTA_SCJ/cred_info", {
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });
        jsonData = jsonData.data.objects;

        async function connectToDatabase() {
            const connection = await mysql.createConnection({
                host: process.env.SQLHOST,
                user: process.env.SQLUSER,
                password: process.env.SQLPASSWORD,
                database: process.env.SQLDATABASE,
            });
            return connection;
        }

        async function insertNonMatchingRecord(connection, record) {
            let revisaoVal = 0;
            const revisao = await connection.execute(`SELECT * FROM ANALISE_CREDITO WHERE NUMERO_PEDIDO = ${record.CJ_NUM} AND FILIAL = ${record.CJ_FILIAL}`);

            if(revisao[0].length !== 0){
                revisaoVal = revisao[0].length + 1
            }

            await connection.execute(`INSERT INTO ANALISE_CREDITO (
                DATA_SOLICIT,
                NUMERO_PEDIDO,
                FILIAL,
                LOJA,
                COD_CLIENTE,
                LOJA_ENTREGA,
                VENDEDOR,
                HORA_SOLICIT,
                VALOR_PEDIDO,
                LIMITE_ATUAL,
                CLIENTE,
                EMAIL_CLIENTE,
                ARQUIVA,
                ARQUIVADO,
                REVISAO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                record.CJ_XDTSOLI || null,
                record.CJ_NUM || null,
                record.CJ_FILIAL || null,
                record.CJ_LOJA || null,
                record.CJ_CLIENTE || null,
                record.CJ_LOJAENT || null,
                record.CJ_XVEND1 || null,
                record.CJ_XHRSOLI || null,
                record.VALOR_VENDA || null,
                record.A1_LC || null,
                record.A1_NOME || null,
                record.A1_EMAIL || null,
                0,
                0,
                revisaoVal
            ]);
        }

        async function compareDateTime() {
            const connection = await connectToDatabase();

            for (const jsonDataItem of jsonData) {
                const [rows] = await connection.execute(`
                    SELECT ID, DATA_SOLICIT FROM ANALISE_CREDITO 
                    WHERE DATA_SOLICIT = ? AND HORA_SOLICIT = ? AND NUMERO_PEDIDO = ? AND FILIAL = ? AND LOJA = ? AND COD_CLIENTE = ?`, 
                    [jsonDataItem.CJ_XDTSOLI, jsonDataItem.CJ_XHRSOLI, jsonDataItem.CJ_NUM, jsonDataItem.CJ_FILIAL, jsonDataItem.CJ_LOJA, jsonDataItem.CJ_CLIENTE]
                );

                if (rows.length <= 0) {
                    await insertNonMatchingRecord(connection, jsonDataItem);
                }
            }

            await connection.end();
        }

        await compareDateTime();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function documento(req, res) {
    try {
        res.status(200).json(await financeiroModel.documento(req.query.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function vendedor(req, res) {
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/unico?codigo=${req.query.cod}`, {
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });
        res.send(response.data.objects[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function sendDocumentRequestEmail(req, res) {
    try {
        const now = new Date();

        const emailContent = `
            Olá,

            Em virtude de estarmos efetuando a atualização de cadastro da empresa INSERIR NOME CLIENTE e analisando a possibilidade de aumentar ou estabelecer um limite, solicitamos a transmissão através do e-mail abaixo os seguintes documentos:

            1. Ficha Cadastral da empresa, com dados bancários e referências comerciais; 
            2. Contrato Social e Última Alteração Contratual;
            3. Três boletos recentes (com os respectivos comprovantes de pagamento) de valores expressivos e de acordo com o limite pretendido; 
            4. Declaração de Faturamento dos últimos 12 meses;
            5. No caso de empresas optantes pelo regime do Simples Nacional, enviar o extrato do Simples (PGDAS – Poderá ser solicitado ao seu Contador/Contabilidade)
            6. Três últimos Balanços Patrimoniais com a D.R.E. (Demonstrativo de Resultado do Exercício)

            OBSERVAÇÕES:

            - Salientamos que os boletos tem finalidade de agilizar nossa avaliação financeira, uma vez que evidenciam, de certa forma, o bom relacionamento comercial e assiduidade nos pagamentos.
            - Para valores inferiores a R$ 5.000,00 (Cinco Mil Reais), os documentos relacionados no item 06 não são necessários, mas ao enviá-los, irão auxiliar na definição de um limite inicial para próximas compras. 
            - O valor de faturamento mínimo é R$ 1.000,00 (Hum mil Reais). Para compras à vista, o valor mínimo é de R$ 1.000,00 (Hum mil Reais). 
            - A Fibracem se reserva ao direito de solicitar garantias financeiras através da carta de fiança bancária e/ou qualquer outro instrumento similar;
            - Após o envio da documentação completa o prazo para resposta é de 48 horas. 
            - Toda a documentação enviada será utilizada exclusivamente pela Fibracem, sendo vedada a transmissão de documentos para outras empresas.
                                                                                        
            Quaisquer dúvidas estou à disposição.

            Att. Cadastro - Fibracem 
            Email: cadastro@fibracem.com
            Tel: 3661-2585  
        `;

        const checkEmail = JSON.parse(req.query.checkemail.toLowerCase());
        if(!checkEmail){
            await sendEmailCadastro(req.query.email, 'Requisição de Documentos.', emailContent);
            await financeiroModel.solicitCliente(req.query.id, formatDateToMySQL(now));
        }else{
            await financeiroModel.solicitCliente(req.query.id, formatDateToMySQL(now));
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function docOk(req, res) {
    try {
        const now = new Date();

        const recipient = req.query.valor <= 20000.00 ? 'aux.adm@fibracem.com' : 'financeiro@fibracem.com';
        const approver = req.query.valor <= 20000.00 ? 'Natali Evelin Peres Pereira' : 'Kesley Machado';

        await sendEmailCadastro(
            recipient,
            'Requisição de Documentos.',
            `Você tem uma nova solicitação de análise de crédito. ID ${req.query.id}.`
        );

        await financeiroModel.dataDocOk(req.query.id, formatDateToMySQL(now), approver, req.query.obs, adicionarHorasUteis(now, 48));

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function trocaResp(req, res) {
    try {
        await financeiroModel.trocaResp(req.query.id, req.query.resp);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function credFinaliza(req, res) {
    try {
        const emailCli = req.body[6].emailCli;
        //const emailVend = req.body[6].email;
        const diferenca = req.body[1].diferenca;
        const limite = req.body[2].limite;
        const id = req.body[3].id;
        const checkEmailCli = req.body[4].checkEmailCli;
        const checkEmailVend = req.body[5].checkEmailVend;
        const numPedido = req.body[7].pedido;
        const filial = req.body[8].filial;
        const vendCod = req.body[9].vendCod;
        const porcentagem = req.body[10].porcentagem;
        const valorPedido = req.body[11].valor;
        const respostaAnalise = req.body[12].respostaAnalise;
        const obsResposta = req.body[13].obsResposta;
        const novoLimite = req.body[14].novo_limite;

        const emailVendApi = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/unico?codigo=${vendCod}`, {
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        const emailVend = emailVendApi.data.objects[0].A3_EMAIL;

        await financeiroModel.credFinalizaData(formatCurrentDateTimeForMySQL(), 1, id);

        if(req.body[0].result != 'REPROVADO'){

            if(req.body[0].result == 'APROVADO'){
                if(checkEmailCli){
                    await sendEmailCadastro(
                        emailCli,
                        'Crédito liberado',
                        `Olá. Informamos que após análise financeira o orçamento ${numPedido} foi liberado para faturamento.`
                    );
                };
    
                if(checkEmailVend){
                    await sendEmailCadastro(
                        emailVend,
                        'Crédito liberado',
                        `Olá. Informamos que após análise financeira o orçamento ${numPedido} da filial ${filial} foi liberado para faturamento.`
                    );
                };

                await financeiroModel.credFinaliza(req.body[0].result, novoLimite, respostaAnalise, obsResposta, id);

            }else if(req.body[0].result == 'PARCIAL'){
                const valor_adiant = (valorPedido * porcentagem) / 100;
                if(checkEmailCli){
                    await sendEmailCadastro(
                        emailCli,
                        'Crédito liberado parcialmente',
                        `Informamos que, após avaliação financeira para o orçamento ${numPedido} no valor aproximado de R$ ${formatarParaMoedaBrasileira(valorPedido)} fica estabelecido que ${porcentagem}% deste valor deverá ser antecipado, ficando o restante para faturamento a prazo.`
                    );
                };
    
                if(checkEmailVend){
                    await sendEmailCadastro(
                        emailVend,
                        'Crédito liberado parcialmente',
                        `Informamos que, após avaliação financeira para o orçamento ${numPedido} da filial ${filial} no valor aproximado de R$ ${formatarParaMoedaBrasileira(valorPedido)} fica estabelecido que ${porcentagem}% deste valor deverá ser antecipado, ficando o restante para faturamento a prazo.`
                    );
                };

                await financeiroModel.credFinalizaParcial(req.body[0].result, porcentagem, valor_adiant, respostaAnalise, obsResposta, id);
            }
        }else{
            if(checkEmailCli){
                await sendEmailCadastro(
                    emailCli,
                    'Liberação de crédito reprovada',
                    `Informamos que, após avaliação financeira do pedido ${numPedido} de aproximadamente R$ ${formatarParaMoedaBrasileira(valorPedido)} fica estabelecido que o pagamento deverá ser antecipado, o pedido será aceito após confirmação do depósito. `
                );
            }

            if(checkEmailVend){
                await sendEmailCadastro(
                    emailVend,
                    'Liberação de crédito reprovada',
                    `Informamos que, após avaliação financeira do pedido ${numPedido} de aproximadamente R$ ${formatarParaMoedaBrasileira(valorPedido)} fica estabelecido que o pagamento deverá ser antecipado, o pedido será aceito após confirmação do depósito. `
                );
            }

            await financeiroModel.credFinalizaReprov(req.body[0].result, respostaAnalise, obsResposta, id);
        }
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

async function arquivar(req, res) {
    try {
        await financeiroModel.arquivar(req.body.id);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

async function parcelas(req, res) {
    try {
        let cgc = req.query.cgc;

        // Verificação de entrada
        if (!cgc || cgc.length < 8) {
            return res.status(400).send({ error: 'CGC deve ter pelo menos 8 caracteres.' });
        }

        const cgcRoot = cgc.slice(0, 8);
        const response = await axios.get(`${process.env.APITOTVS}CONSULTA_SE1/CRED_PARC?stats_parc=A&raiz_cnpj=${cgcRoot}`, {
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        let resposta = []

        response.data.objects.forEach(element => {
            const formatDate = (dateStr) => {
                const [year, month, day] = [dateStr.slice(0, 4), dateStr.slice(4, 6), dateStr.slice(6)];
                return `${day}/${month}/${year}`;
            };
        
            resposta.push({
                'E1_FILIAL': element.E1_FILIAL,
                'E1_PREFIXO': element.E1_PREFIXO,
                'E1_NUM': element.E1_NUM,
                'E1_PARCELA': element.E1_PARCELA,
                'E1_VENCTO': formatDate(element.E1_VENCTO),
                'E1_VALOR': formatarParaMoedaBrasileira(element.E1_VALOR),
                'E1_SALDO': formatarParaMoedaBrasileira(element.E1_SALDO),
                'E1_CLIENTE': element.E1_CLIENTE,
                'E1_LOJA': element.E1_LOJA,
                'E1_EMISSAO': formatDate(element.E1_EMISSAO),
                'E1_STATUS': element.E1_STATUS,
                'A1_NOME': element.A1_NOME,
                'A1_LC': element.A1_LC,
                'A1_CGC': element.A1_CGC
            });
        });

        res.send(resposta);
    } catch (error) {
        if(error.response.data.errorId == 'ALL003'){
            res.status(404).send({ error: 'Parcelas não encontradas.' });
        }else{
            console.error('Erro ao consultar parcelas:', error.message);
            res.status(500).send({ error: 'Erro interno do servidor.' });
        }
    }
}

async function nfcte(req, res) {
    try {
        const numero    = !req.query.numero    ? ''  : req.query.numero;
        const orcamento = !req.query.orcamento ? ''  : req.query.orcamento;

        const response = await axios.get(`${process.env.APITOTVS}CONSULTA_SF2/grid?numero=${numero}&orcamento=${orcamento}`, {
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        const items = [];
        let freteSemImposto = 0;

        response.data.objects.forEach(element => {

            if(element.F2_FILIAL == '0101001' || element.F2_FILIAL == '0101002'){
                freteSemImposto = element.C5_FRETE * 0.7
            }else{
                freteSemImposto = element.C5_FRETE * 0.8
            }

            freteSemImposto = parseFloat(freteSemImposto.toFixed(2));
            console.log(freteSemImposto)
            items.push({
                F2_FILIAL:       element.F2_FILIAL,
                F2_DOC:          element.F2_DOC,
                F2_SERIE:        element.F2_SERIE,
                F2_FRETE:        formatarParaMoedaBrasileira(element.F2_FRETE),
                F2_ICMFRET:      formatarParaMoedaBrasileira(element.F2_ICMFRET),
                C5_NUM:          element.C5_NUM,
                C5_FRETE:        formatarParaMoedaBrasileira(element.C5_FRETE),
                CJ_NUM:          element.CJ_NUM,
                CJ_FRTORI:       element.CJ_FRTORI,
                FRETESEMIMPOSTO: freteSemImposto,
                R_E_C_N_O_:      element.R_E_C_N_O_
            })
        });

        res.json(items);
    } catch (error) {
        console.log(error)
        if(error.response.status == 404){
            res.sendStatus(404)
        }else{
            res.sendStatus(500); 
        }
    }
}

async function nfcteEntrada(req, res) {
    try {
        const {numero = ''} = req.query

        const response = await axios.get(`${process.env.APITOTVS}CONSULTA_SF1/grid?`, {
            params: {numero},
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        const items = response.data.objects.map(element =>({
            F1_DOC:       element.F1_DOC,
            F1_XNUMORC:   element.F1_XNUMORC,
            F1_FRETE:     element.F1_FRETE,
            C7_FRETE:     element.C7_FRETE,
            R_E_C_N_O_:   element.R_E_C_N_O_
        }))

        res.json(items);
    } catch (error) {
        if(error.response.status == 404){
            res.sendStatus(404)
        }else{
            console.log(error)
            res.sendStatus(500); 
        }
    }
}

async function gridCte(req, res) {
    try {

        const {arquivado = 0, id = '', nf = '', cte = '', freteNf = '', freteCte = ''} = req.query

        const data = await financeiroModel.gridCteNf(arquivado, id, nf, cte, freteNf, freteCte);

        const grid = data.map(e => ({
            id: e.id,
            numero_nf:  e.numero_nf,
            numero_cte: e.numero_cte,
            frete_nf:   formatCurrency(e.frete_nf),
            frete_cte:  formatCurrency(e.frete_cte)
        }));

        res.json(grid);
    } catch (error) {
        console.error('Erro ao obter dados da tabela cte_nf:', error);
        res.sendStatus(500); // Envia o status 500 em caso de erro
    }
}

async function refreshCte(req, res) {
    const sftp = new Client();

    const sftpConfig = {
        host: process.env.FTPHOST,
        port: process.env.FTPPORT,
        username: process.env.FTPUSERNAME,
        password: process.env.FTPPASSWORD
    };

    function getCommonElements(array1, array2) {
        const set2 = new Set(array2);
        return array1.filter(item => set2.has(item));
    }

    function addXmlExtension(array) {
        return array.map(item => `${item}.xml`);
    }

    function removeDuplicates(arr) {
        return [...new Set(arr)];
    }

    function chavePraNumero(str) {
            // Garantir que o item seja uma string
            str.toString();
            // Remover os 25 primeiros dígitos
            const trimmed = str.substring(25);
            // Manter apenas os primeiros 10 dígitos restantes
            return trimmed.substring(0, 9);
    }

    const directory = `/${process.env.FTPUSERNAME}/dev/importadorxml/lidos`;

    try {
        const chavesNf = await axios.get(`${process.env.APITOTVS}CONSULTA_SF3/chave`, {
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        let chaves = chavesNf.data.objects.map(element => element.F3_CHVNFE);

        chaves = removeDuplicates(chaves);

        await sftp.connect(sftpConfig);
        console.log('Conexão SFTP estabelecida.');

        const data = await sftp.list(directory);
        let trimmedArray = data.map(item => item.name.slice(0, 44));

        const kiko = trimmedArray.filter(element => element.length === 44 && /^\d+$/.test(element));

        let seuMadruga = getCommonElements(chaves, kiko);

        seuMadruga = removeDuplicates(seuMadruga);



        for (const [index, element] of seuMadruga.entries()) {
            const remoteFilePath = `/${process.env.FTPUSERNAME}/dev/importadorxml/lidos/${element}.xml`;
            const localFilePath = `./storage/cte/${element}.xml`;

            try {
                const fileExists = await sftp.exists(remoteFilePath);
                if (fileExists) {
                    await sftp.get(remoteFilePath, localFilePath);
                    console.log(`Arquivo ${element}.xml baixado com sucesso. Índice: ${index}`);

                    // Ler e analisar o conteúdo do arquivo XML
                    const xmlContent = await fs.readFile(localFilePath, { encoding: 'utf-8' });
                    const result = await xml2js.parseStringPromise(xmlContent);

                    // Extrair o valor da tag <chave>
                    const chave = result.cteProc?.CTe?.[0]?.infCte?.[0]?.infCTeNorm?.[0]?.infDoc?.[0]?.infNFe?.[0]?.chave[0];
                    const valFrete = result.cteProc?.CTe?.[0]?.infCte?.[0]?.vPrest?.[0]?.vTPrest[0]

                    let freteNf = 0.0;
                    if (chave) {

                        try {
                            freteNf = await axios.get(`${process.env.APITOTVS}CONSULTA_SFT/get_chave?chave=${chave}`, {
                                auth: {
                                    username: process.env.USERTOTVS,
                                    password: process.env.SENHAPITOTVS
                                }
                            });
                        } catch (error) {
                            console.error(`Erro ao buscar freteNf: ${error}`);
                        }

                        if(freteNf.data.solution == 'A consulta de registros n�o retornou nenhuma informa��o'){
                            await financeiroModel.insertCteNf(chave, element, null, valFrete, chavePraNumero(chave), chavePraNumero(element))
                        }else{
                            await financeiroModel.insertCteNf(chave, element, freteNf.data.objects[0].FT_FRETE, valFrete, chavePraNumero(chave), chavePraNumero(element))
                            console.log(`Chave encontrada no arquivo ${element}.xml: ${chave}`);
                        }

                        try {
                            await axios.put(`${process.env.APITOTVS}CONSULTA_SF3/grdcte?chave=${element}`, '', {
                                auth: {
                                    username: process.env.USERTOTVS,
                                    password: process.env.SENHAPITOTVS
                                }
                            });
                        } catch (error) {
                            console.error(`Erro ao atualizar F3_XGRDCTE CTE ${element}: ${error}`);
                        }


                    } else if (!chave) {
                        const chave = result.cteProc?.CTe?.[0]?.infCte?.[0]?.infCteComp?.[0]?.chCTe[0];

                        try {
                            freteNf = await axios.get(`${process.env.APITOTVS}CONSULTA_SFT/get_chave?chave=${chave}`, {
                                auth: {
                                    username: process.env.USERTOTVS,
                                    password: process.env.SENHAPITOTVS
                                }
                            });
                        } catch (error) {
                            console.error(`Erro ao buscar freteNf: ${error}`);
                        }

                        if(freteNf.data.solution == 'A consulta de registros n�o retornou nenhuma informa��o'){
                            await financeiroModel.insertCteNf(chave, element, null, valFrete, chavePraNumero(chave), chavePraNumero(element))
                        }else{
                            await financeiroModel.insertCteNf(chave, element, freteNf.data.objects[0].FT_FRETE, valFrete, chavePraNumero(chave), chavePraNumero(element))
                            console.log(`Chave encontrada no arquivo (padrao diferente) ${element}.xml: ${chave}`);
                        }

                        try {
                            await axios.put(`${process.env.APITOTVS}CONSULTA_SF3/grdcte?chave=${element}`, '', {
                                auth: {
                                    username: process.env.USERTOTVS,
                                    password: process.env.SENHAPITOTVS
                                }
                            });
                        } catch (error) {
                            console.error(`Erro ao atualizar F3_XGRDCTE CTE ${element}: ${error}`);
                        }

                    } else{
                        console.log(`Tag <chave> não encontrada no arquivo ${element}.xml`);
                    }
                } else {
                    console.log(`Arquivo ${element}.xml não encontrado no servidor FTP. Índice: ${index}`);
                }
            } catch (err) {
                console.error(`Erro ao verificar ou baixar o arquivo ${element}.xml no índice ${index}:`, err);
            }
        }

        await sftp.end();
        console.log('Conexão SFTP encerrada.');
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

async function arquivaCte(req, res) {
    try {
        await financeiroModel.arquivaCteNf(req.body.id);
        res.sendStatus(200)
    } catch (error) {
        console.error('Erro ao arquivar:', error);
        res.sendStatus(500); // Envia o status 500 em caso de erro
    }
}

async function pdfNf(req, res) {
    const {numero = ''} = req.query;

    try {
        const response = await axios.get(`${process.env.APITOTVS}CONSULTA_SF2/pdfnf`, {
            params: {numero},
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        res.json(response.data.objects)
    } catch (error) {
        console.log(error);
        res.sendStatus(error.response?.status || 500);
    }
  }

  async function roboBusca(req, res) {
    try {
        const { chave } = req.query;
        const browser = await puppeteer.launch({ headless: true, args: ['--disable-setuid-sandbox', '--no-sandbox'] });
        const page = await browser.newPage();
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Navegar para a URL e preencher a chave
        await page.goto('https://meudanfe.com.br/');
        await page.waitForSelector('input[placeholder="Digite a CHAVE DE ACESSO"]');
        await page.type('input[placeholder="Digite a CHAVE DE ACESSO"]', chave);
        await page.click('button.absolute.m-1.inset-y-0.right-0.px-4.rounded-full.bg-meuDanfeColors-700.hover\\:bg-meuDanfeColors-600.text-white.text-lg.font-semibold.focus\\:ring-2.focus\\:ring-meuDanfeColors-600.focus\\:outline-none');
        await delay(2000);
        await page.click('button.flex.col-span-4.sm\\:col-span-1.sm\\:w-80.px-3.py-3.text-sm.font-semibold.leading-6.text-white.cursor-pointer.inline-flex.items-center.justify-center.rounded-full.shadow-lg.shadow-contrast-orange\\/50.bg-contrast-orange.hover\\:bg-contrast-orange\\/80.transition.duration-300.ease-in-out');

        // Aguardar a nova página (ou aba) ser criada
        const newPagePromise = new Promise(resolve => browser.once('targetcreated', async target => {
            const newTargetPage = await target.page();
            if (newTargetPage) {
                resolve(newTargetPage);
            }
        }));

        const newPage = await newPagePromise;

        // Esperar a nova página carregar completamente
        await newPage.waitForSelector('embed, iframe, object', { timeout: 30000 });

        // Capturar a URL do PDF
        const pdfUrl = await newPage.evaluate(() => {
            const embed = document.querySelector('embed');
            if (embed && embed.src) {
                return embed.src;
            }
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.src) {
                return iframe.src;
            }
            const object = document.querySelector('object');
            if (object && object.data) {
                return object.data;
            }
            return null;
        });

        if (!pdfUrl) {
            await browser.close();
            return res.status(500).send('Não foi possível encontrar o PDF.');
        }

        // Importar o fetch dinamicamente
        const fetch = (await import('node-fetch')).default;

        // Baixar o PDF
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const storagePath = path.join(__dirname, 'storage');
        await fs.mkdir(storagePath, { recursive: true });

        await fs.writeFile(`./storage/nf/${chave}.pdf`, buffer);

        await browser.close();

        await delay(1000);

        res.download(path.join(__dirname, '../storage/nf', `${chave}.pdf`));

    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}

  async function guiaNf(req, res){
    try {
        const {numero = ''} = req.query;

        const guias = await financeiroModel.guiasNf(numero);

        const resposta = guias.map(e =>({
            D2_FILIAL:  e.D2_FILIAL,
            D2_DOC:     e.D2_DOC,
            GUIA:       e.GUIA,
            GUIA_DATA:  sqlServerDateTimeToString(e.GUIA_DATA),
            PASTA:      e.PASTA,
            PASTA_DATA: sqlServerDateTimeToString(e.PASTA_DATA),
            D2_CLASFIS: e.CLASFIS,
            D2_PEDIDO:  e.D2_PEDIDO,
            D2_CF:      e.D2_CF
        }))

        res.json(resposta)

    } catch (error) {
        res.sendStatus(500)
        console.error(error);
    }
  }

  async function marcarGuia(req, res){
    try {
        await financeiroModel.marcarBox(req.body);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500)
        console.error(error);
    }
  }

module.exports = { 
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
    refreshCte,
    gridCte,
    arquivaCte,
    pdfNf,
    roboBusca,
    guiaNf,
    marcarGuia
};