const express = require("express");
const financeiroModel = require("../models/financeiroModel");
const router = express.Router();
const path = require('path')
const axios = require('axios');
const moment = require('moment');
const nodemailer = require('nodemailer');

router.get("/analise-de-credito", async(req, res)=>{
    try {
        res.json(await financeiroModel.analiseDeCredito());
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/atualiza-proposta-de-frete", async(req, res)=>{
    try {
        const mysql = require('mysql2/promise');

        // Consulta API TOTVS
        let jsonData = await axios.get(process.env.APITOTVS + "CONSULTA_SCJ/cred_info", {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        jsonData = jsonData.data.objects

        // Função para conectar ao banco de dados
        async function connectToDatabase() {
        const connection = await mysql.createConnection({
            host: process.env.SQLHOST,
            user: process.env.SQLUSER,
            password: process.env.SQLPASSWORD,
            database: process.env.SQLDATABASE,
        });
        return connection;
        }

        // Função para inserir registros não coincidentes
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
            record.CJ_XDTSOLI   || null, // DATA_SOLICIT
            //record.CJ_XSTACRE || null, // LEGENDA
            record.CJ_NUM       || null, // NUMERO_PEDIDO
            record.CJ_FILIAL    || null, // FILIAL
            record.CJ_LOJA      || null, // LOJA
            record.CJ_CLIENTE   || null, // COD_CLIENTE
            record.CJ_LOJAENT   || null, // LOJA_ENTREGA
            record.CJ_XVEND1    || null, // VENDEDOR
            record.CJ_XHRSOLI   || null, // HORA_SOLICIT
            record.VALOR_VENDA  || null, // VALOR_PEDIDO
            record.A1_LC        || null, // LIMITE_ATUAL
            record.A1_NOME        || null, // LIMITE_ATUAL
            record.A1_EMAIL        || null, // LIMITE_ATUAL
        ]);
        }

        // Função para comparar os dados JSON com os dados do MySQL
        async function compareDateTime() {
        const connection = await connectToDatabase();

        for (const jsonDataItem of jsonData) {
            const [rows] = await connection.execute(`
            SELECT ID, DATA_SOLICIT FROM ANALISE_CREDITO WHERE DATA_SOLICIT = ? AND HORA_SOLICIT = ? AND NUMERO_PEDIDO = ? AND FILIAL = ? AND LOJA = ? AND COD_CLIENTE = ?`, 
            [jsonDataItem.CJ_XDTSOLI, jsonDataItem.CJ_XHRSOLI, jsonDataItem.CJ_NUM, jsonDataItem.CJ_FILIAL, jsonDataItem.CJ_LOJA, jsonDataItem.CJ_CLIENTE]);

            if (rows.length <= 0) {
                await insertNonMatchingRecord(connection, jsonDataItem); // Insere o registro não coincidente
            }
        }

        await connection.end();
        }

        compareDateTime().catch(err => console.error(err));
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/documento", async(req, res)=>{
    try {
        res.status(200).json(await financeiroModel.documento(req.query.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/vendedor", async(req, res)=>{
    try {
        const response = await axios.get(process.env.APITOTVS + `CONSULTA_SA3/unico?codigo=${req.query.cod}`, {auth: {username: process.env.USERTOTVS, password: process.env.SENHAPITOTVS}});
        res.send(response.data.objects[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/email", async(req, res)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: "outlook.maiex13.com.br",
            port: 587,
            auth: {
              user: "suporte@fibracem.com",
              pass: process.env.SUPORTEPASSWORD,
            },
          });

        let mailOptions = {
            from: 'suporte@fibracem.com',
            to: [`informatica04@fibracem.com`], //COLOCAR req.query.email EM PRODUCAO!!!!
            subject: `Requisição de Documentos.`,
            text: `Olá,

                    Em virtude de estarmos efetuando a atualização de cadastro da  empresa INSERIR NOME CLIENTE e analisando a possibilidade de aumentar ou estabelecer um limite,  solicitamos a transmissão através do e-mail abaixo os seguintes documentos:

                    1.            Ficha Cadastral da empresa, com dados bancários e referências comerciais; 
                    2.            Contrato Social e Última Alteração Contratual;
                    3.            Três boletos recentes (com os respectivos comprovantes de pagamento) de valores expressivos e de acordo com o limite pretendido; 
                    4.            Declaração de Faturamento dos últimos 12 meses;
                    5.            No caso de empresas optantes pelo regime do Simples Nacional, enviar o extrato do Simples (PGDAS – Poderá ser solicitado ao seu Contador/Contabilidade)
                    6.            Três últimos Balanços Patrimoniais com a D.R.E. (Demonstrativo de Resultado do Exercício)

                    OBSERVAÇÕES:

                    -              Salientamos que os boletos tem finalidade de agilizar nossa avaliação financeira, uma vez que evidenciam, de certa forma, o bom relacionamento comercial e assiduidade nos pagamentos.
                    -              Para valores inferiores a R$ 5.000,00 (Cinco Mil Reais), os documentos relacionados no item 06 não são necessários, mas ao enviá-los, irão auxiliar na definição de um limite inicial para próximas compras. 
                    -              O valor de faturamento mínimo é R$ 1.000,00 (Hum mil Reais). Para compras à vista, o valor mínimo é de R$ 1.000,00 (Hum mil Reais). 
                    -              A Fibracem se reserva ao direito de solicitar garantias financeiras através da carta de fiança bancária e/ou qualquer outro instrumento similar;
                    -              Após o envio da documentação completa o prazo para resposta é de 48 horas. 
                    -              Toda a documentação enviada será utilizada exclusivamente pela Fibracem, sendo vedada a transmissão de documentos para outras empresas.
                                                                                            

                    Quaisquer dúvidas estou à disposição.

                    Att. Cadastro - Fibracem 
                    Email: cadastro@fibracem.com
                    Tel: 3661-2585  `
        };
        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log(err);
                throw new Error
            }
        });
        const formatDate = (date) => {
            return moment(date).format('DD/MM/YYYY HH:mm');
        };

        const now = new Date();
        formatDate(now)

        function formatDateToMySQL(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
          
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        await financeiroModel.solicitCliente(req.query.id, formatDateToMySQL(now));
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get("/docok", async(req, res)=>{
    try {
        const now = new Date();

        function formatDateToMySQL(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
          
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        


        if(req.query.valor <= 20000.00){
            const transporter = nodemailer.createTransport({
                host: "outlook.maiex13.com.br",
                port: 587,
                auth: {
                  user: "suporte@fibracem.com",
                  pass: process.env.SUPORTEPASSWORD,
                },
              });
    
            let mailOptions = {
                from: 'suporte@fibracem.com',
                to: [`informatica04@fibracem.com`], //COLOCAR email da Nathaly EM PRODUCAO!!!!
                subject: `Requisição de Documentos.`,
                text: `Você tem uma nova solicitação de análise de Credito. ID ${req.query.id}.`
            };
            transporter.sendMail(mailOptions, function(err, data) {
                if (err) {
                    console.log(err);
                    throw new Error
                }
            });
            await financeiroModel.dataDocOk(req.query.id, formatDateToMySQL(now), 'Natali Evelin Peres Pereira');
        }else{
            const transporter = nodemailer.createTransport({
                host: "outlook.maiex13.com.br",
                port: 587,
                auth: {
                  user: "suporte@fibracem.com",
                  pass: process.env.SUPORTEPASSWORD,
                },
              });
    
            let mailOptions = {
                from: 'suporte@fibracem.com',
                to: [`informatica04@fibracem.com`], //COLOCAR email do Kesley EM PRODUCAO!!!!
                subject: `Requisição de Documentos.`,
                text: `Você tem uma nova solicitação de análise de Credito. ID ${req.query.id}.`
            };
            transporter.sendMail(mailOptions, function(err, data) {
                if (err) {
                    console.log(err);
                    throw new Error
                }
            });
            await financeiroModel.dataDocOk(req.query.id, formatDateToMySQL(now), 'Kesley Machado'); 
        }
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;