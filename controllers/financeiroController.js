const financeiroModel = require('../models/financeiroModel');
const axios = require('axios');
const { formatDateToMySQL, formatCurrentDateTimeForMySQL } = require('../utils/dateUtils');
const { sendEmail } = require('../services/emailService');
const { sendEmailCadastro } = require('../services/emailServiceCadastro');
const { formatarParaMoedaBrasileira } = require('../utils/formatarParaMoedaBrasileira');
const { adicionarHorasUteis } = require('../utils/businessHours');

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
                ARQUIVADO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
                0
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

        await sendEmailCadastro(req.query.email, 'Requisição de Documentos.', emailContent);
        await financeiroModel.solicitCliente(req.query.id, formatDateToMySQL(now));
        
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
    parcelas
};