const financeiroModel = require('../models/financeiroModel');
const axios = require('axios');
const { formatDateToMySQL } = require('../utils/dateUtils');
const { sendEmail } = require('../services/emailService');

async function analiseDeCredito(req, res) {
    try {
        res.json(await financeiroModel.analiseDeCredito());
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
                EMAIL_CLIENTE
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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

        await sendEmail('informatica04@fibracem.com', 'Requisição de Documentos.', emailContent);
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

        const recipient = req.query.valor <= 20000.00 ? 'informatica04@fibracem.com' : 'informatica04@fibracem.com';
        const approver = req.query.valor <= 20000.00 ? 'Natali Evelin Peres Pereira' : 'Kesley Machado';

        await sendEmail(
            recipient,
            'Requisição de Documentos.',
            `Você tem uma nova solicitação de análise de crédito. ID ${req.query.id}.`
        );

        await financeiroModel.dataDocOk(req.query.id, formatDateToMySQL(now), approver, req.query.obs);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

module.exports = { 
    analiseDeCredito, 
    atualizaPropostaDeFrete, 
    documento, 
    vendedor, 
    sendDocumentRequestEmail, 
    docOk 
};