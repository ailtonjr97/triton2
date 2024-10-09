const axios = require('axios');
const { sql, connectToDatabase } = require('../../services/dbConfig.js');

function getCurrentDateString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() retorna 0-11, então adicionamos 1
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}

function getCurrentSQLServerDateTime() {
    const jsDate = new Date();

    const pad = (number) => (number < 10 ? '0' + number : number);

    const year = jsDate.getFullYear();
    const month = pad(jsDate.getMonth() + 1);
    const day = pad(jsDate.getDate());
    const hours = pad(jsDate.getHours());
    const minutes = pad(jsDate.getMinutes());
    const seconds = pad(jsDate.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function atualizarSea(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SEA/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS,
            },
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Criar uma matriz de promessas para verificar e atualizar/inserir registros
        const promises = notas.data.objects.map(async (element) => {
            const {
                EA_FILIAL,
                EA_PREFIXO,
                EA_NUM,
                EA_PARCELA,
                EA_PORTADO,
                EA_AGEDEP,
                EA_NUMBOR,
                EA_DATABOR,
                EA_TIPO,
                EA_CART,
                EA_FORNECE,
                EA_LOJA,
                EA_NUMCON,
                EA_MODELO,
                EA_TIPOPAG,
                EA_TRANSF,
                EA_SITUACA,
                EA_SALDO,
                EA_SITUANT,
                EA_OCORR,
                EA_FILORIG,
                EA_PORTANT,
                EA_AGEANT,
                EA_CONTANT,
                EA_DEBITO,
                EA_CCD,
                EA_ITEMD,
                EA_CLVLDB,
                EA_CREDIT,
                EA_CCC,
                EA_ITEMC,
                EA_CLVLCR,
                EA_ORIGEM,
                EA_BORAPI,
                EA_APIMSG,
                EA_APILOG,
                EA_APIMAIL,
                EA_SUBCTA,
                EA_ESPECIE,
                EA_IDTRANS,
                EA_VERSAO,
                S_T_A_M_P_,
                R_E_C_N_O_,
                R_E_C_D_E_L_,
            } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SEA010 WHERE EA_FILORIG = ${EA_FILORIG} AND EA_NUMBOR = ${EA_NUMBOR} AND EA_PREFIXO = ${EA_PREFIXO} AND EA_NUM = ${EA_NUM} AND EA_PARCELA = ${EA_PARCELA} AND EA_TIPO = ${EA_TIPO} AND EA_FORNECE = ${EA_FORNECE} AND EA_LOJA = ${EA_LOJA}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE SEA010 SET 
                    EA_FILIAL = ${EA_FILIAL}, 
                    EA_PREFIXO = ${EA_PREFIXO}, 
                    EA_NUM = ${EA_NUM}, 
                    EA_PARCELA = ${EA_PARCELA}, 
                    EA_PORTADO = ${EA_PORTADO}, 
                    EA_AGEDEP = ${EA_AGEDEP}, 
                    EA_NUMBOR = ${EA_NUMBOR}, 
                    EA_DATABOR = ${EA_DATABOR}, 
                    EA_TIPO = ${EA_TIPO}, 
                    EA_CART = ${EA_CART}, 
                    EA_FORNECE = ${EA_FORNECE}, 
                    EA_LOJA = ${EA_LOJA}, 
                    EA_NUMCON = ${EA_NUMCON}, 
                    EA_MODELO = ${EA_MODELO}, 
                    EA_TIPOPAG = ${EA_TIPOPAG}, 
                    EA_TRANSF = ${EA_TRANSF}, 
                    EA_SITUACA = ${EA_SITUACA}, 
                    EA_SALDO = ${EA_SALDO}, 
                    EA_SITUANT = ${EA_SITUANT}, 
                    EA_OCORR = ${EA_OCORR}, 
                    EA_FILORIG = ${EA_FILORIG}, 
                    EA_PORTANT = ${EA_PORTANT}, 
                    EA_AGEANT = ${EA_AGEANT}, 
                    EA_CONTANT = ${EA_CONTANT}, 
                    EA_DEBITO = ${EA_DEBITO}, 
                    EA_CCD = ${EA_CCD}, 
                    EA_ITEMD = ${EA_ITEMD}, 
                    EA_CLVLDB = ${EA_CLVLDB}, 
                    EA_CREDIT = ${EA_CREDIT}, 
                    EA_CCC = ${EA_CCC}, 
                    EA_ITEMC = ${EA_ITEMC}, 
                    EA_CLVLCR = ${EA_CLVLCR}, 
                    EA_ORIGEM = ${EA_ORIGEM}, 
                    EA_BORAPI = ${EA_BORAPI}, 
                    EA_APIMSG = ${EA_APIMSG}, 
                    EA_APILOG = ${EA_APILOG}, 
                    EA_APIMAIL = ${EA_APIMAIL}, 
                    EA_SUBCTA = ${EA_SUBCTA}, 
                    EA_ESPECIE = ${EA_ESPECIE}, 
                    EA_IDTRANS = ${EA_IDTRANS}, 
                    EA_VERSAO = ${EA_VERSAO}, 
                    S_T_A_M_P_ = ${S_T_A_M_P_}, 
                    R_E_C_N_O_ = ${R_E_C_N_O_}, 
                    R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                WHERE EA_FILORIG = ${EA_FILORIG} AND EA_NUMBOR = ${EA_NUMBOR} AND EA_PREFIXO = ${EA_PREFIXO} AND EA_NUM = ${EA_NUM} AND EA_PARCELA = ${EA_PARCELA} AND EA_TIPO = ${EA_TIPO} AND EA_FORNECE = ${EA_FORNECE} AND EA_LOJA = ${EA_LOJA}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO SEA010 (
                    EA_FILIAL,
                    EA_PREFIXO,
                    EA_NUM,
                    EA_PARCELA,
                    EA_PORTADO,
                    EA_AGEDEP,
                    EA_NUMBOR,
                    EA_DATABOR,
                    EA_TIPO,
                    EA_CART,
                    EA_FORNECE,
                    EA_LOJA,
                    EA_NUMCON,
                    EA_MODELO,
                    EA_TIPOPAG,
                    EA_TRANSF,
                    EA_SITUACA,
                    EA_SALDO,
                    EA_SITUANT,
                    EA_OCORR,
                    EA_FILORIG,
                    EA_PORTANT,
                    EA_AGEANT,
                    EA_CONTANT,
                    EA_DEBITO,
                    EA_CCD,
                    EA_ITEMD,
                    EA_CLVLDB,
                    EA_CREDIT,
                    EA_CCC,
                    EA_ITEMC,
                    EA_CLVLCR,
                    EA_ORIGEM,
                    EA_BORAPI,
                    EA_APIMSG,
                    EA_APILOG,
                    EA_APIMAIL,
                    EA_SUBCTA,
                    EA_ESPECIE,
                    EA_IDTRANS,
                    EA_VERSAO,
                    S_T_A_M_P_,
                    R_E_C_N_O_,
                    R_E_C_D_E_L_
                ) VALUES (
                    ${EA_FILIAL},
                    ${EA_PREFIXO},
                    ${EA_NUM},
                    ${EA_PARCELA},
                    ${EA_PORTADO},
                    ${EA_AGEDEP},
                    ${EA_NUMBOR},
                    ${EA_DATABOR},
                    ${EA_TIPO},
                    ${EA_CART},
                    ${EA_FORNECE},
                    ${EA_LOJA},
                    ${EA_NUMCON},
                    ${EA_MODELO},
                    ${EA_TIPOPAG},
                    ${EA_TRANSF},
                    ${EA_SITUACA},
                    ${EA_SALDO},
                    ${EA_SITUANT},
                    ${EA_OCORR},
                    ${EA_FILORIG},
                    ${EA_PORTANT},
                    ${EA_AGEANT},
                    ${EA_CONTANT},
                    ${EA_DEBITO},
                    ${EA_CCD},
                    ${EA_ITEMD},
                    ${EA_CLVLDB},
                    ${EA_CREDIT},
                    ${EA_CCC},
                    ${EA_ITEMC},
                    ${EA_CLVLCR},
                    ${EA_ORIGEM},
                    ${EA_BORAPI},
                    ${EA_APIMSG},
                    ${EA_APILOG},
                    ${EA_APIMAIL},
                    ${EA_SUBCTA},
                    ${EA_ESPECIE},
                    ${EA_IDTRANS},
                    ${EA_VERSAO},
                    ${S_T_A_M_P_},
                    ${R_E_C_N_O_},
                    ${R_E_C_D_E_L_}
                )`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SEA010', ${getCurrentSQLServerDateTime()}, 200)`;
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SEA010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`;
        console.log(error);
        res.sendStatus(500);
    }
}

async function atualizarSeaMassa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SEA/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS,
            },
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SEA010`;

        // Função para inserir registros em lotes de mil
        const batchSize = 1000;
        for (let i = 0; i < notas.data.objects.length; i += batchSize) {
            const batch = notas.data.objects.slice(i, i + batchSize);

            const promises = batch.map(async (element) => {
                const {
                    EA_FILIAL,
                    EA_PREFIXO,
                    EA_NUM,
                    EA_PARCELA,
                    EA_PORTADO,
                    EA_AGEDEP,
                    EA_NUMBOR,
                    EA_DATABOR,
                    EA_TIPO,
                    EA_CART,
                    EA_FORNECE,
                    EA_LOJA,
                    EA_NUMCON,
                    EA_MODELO,
                    EA_TIPOPAG,
                    EA_TRANSF,
                    EA_SITUACA,
                    EA_SALDO,
                    EA_SITUANT,
                    EA_OCORR,
                    EA_FILORIG,
                    EA_PORTANT,
                    EA_AGEANT,
                    EA_CONTANT,
                    EA_DEBITO,
                    EA_CCD,
                    EA_ITEMD,
                    EA_CLVLDB,
                    EA_CREDIT,
                    EA_CCC,
                    EA_ITEMC,
                    EA_CLVLCR,
                    EA_ORIGEM,
                    EA_BORAPI,
                    EA_APIMSG,
                    EA_APILOG,
                    EA_APIMAIL,
                    EA_SUBCTA,
                    EA_ESPECIE,
                    EA_IDTRANS,
                    EA_VERSAO,
                    S_T_A_M_P_,
                    R_E_C_N_O_,
                    R_E_C_D_E_L_,
                } = element;

                await sql.query`INSERT INTO SEA010 (
                    EA_FILIAL, 
                    EA_PREFIXO, 
                    EA_NUM, 
                    EA_PARCELA, 
                    EA_PORTADO, 
                    EA_AGEDEP, 
                    EA_NUMBOR, 
                    EA_DATABOR, 
                    EA_TIPO, 
                    EA_CART, 
                    EA_FORNECE, 
                    EA_LOJA, 
                    EA_NUMCON, 
                    EA_MODELO, 
                    EA_TIPOPAG, 
                    EA_TRANSF, 
                    EA_SITUACA, 
                    EA_SALDO, 
                    EA_SITUANT, 
                    EA_OCORR, 
                    EA_FILORIG, 
                    EA_PORTANT, 
                    EA_AGEANT, 
                    EA_CONTANT, 
                    EA_DEBITO, 
                    EA_CCD, 
                    EA_ITEMD, 
                    EA_CLVLDB, 
                    EA_CREDIT, 
                    EA_CCC, 
                    EA_ITEMC, 
                    EA_CLVLCR, 
                    EA_ORIGEM, 
                    EA_BORAPI, 
                    EA_APIMSG, 
                    EA_APILOG, 
                    EA_APIMAIL, 
                    EA_SUBCTA, 
                    EA_ESPECIE, 
                    EA_IDTRANS, 
                    EA_VERSAO, 
                    S_T_A_M_P_, 
                    R_E_C_N_O_, 
                    R_E_C_D_E_L_
                ) VALUES (
                    ${EA_FILIAL}, 
                    ${EA_PREFIXO}, 
                    ${EA_NUM}, 
                    ${EA_PARCELA}, 
                    ${EA_PORTADO}, 
                    ${EA_AGEDEP}, 
                    ${EA_NUMBOR}, 
                    ${EA_DATABOR}, 
                    ${EA_TIPO}, 
                    ${EA_CART}, 
                    ${EA_FORNECE}, 
                    ${EA_LOJA}, 
                    ${EA_NUMCON}, 
                    ${EA_MODELO}, 
                    ${EA_TIPOPAG}, 
                    ${EA_TRANSF}, 
                    ${EA_SITUACA}, 
                    ${EA_SALDO}, 
                    ${EA_SITUANT}, 
                    ${EA_OCORR}, 
                    ${EA_FILORIG}, 
                    ${EA_PORTANT}, 
                    ${EA_AGEANT}, 
                    ${EA_CONTANT}, 
                    ${EA_DEBITO}, 
                    ${EA_CCD}, 
                    ${EA_ITEMD}, 
                    ${EA_CLVLDB}, 
                    ${EA_CREDIT}, 
                    ${EA_CCC}, 
                    ${EA_ITEMC}, 
                    ${EA_CLVLCR}, 
                    ${EA_ORIGEM}, 
                    ${EA_BORAPI}, 
                    ${EA_APIMSG}, 
                    ${EA_APILOG}, 
                    ${EA_APIMAIL}, 
                    ${EA_SUBCTA}, 
                    ${EA_ESPECIE}, 
                    ${EA_IDTRANS}, 
                    ${EA_VERSAO}, 
                    ${S_T_A_M_P_}, 
                    ${R_E_C_N_O_}, 
                    ${R_E_C_D_E_L_}
                )`;
            });

            // Esperar a conclusão das inserções do lote atual antes de continuar
            await Promise.all(promises);
        }

        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SEA010M', ${getCurrentSQLServerDateTime()}, 200)`;
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SEA010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`;
        console.log(error);
        res.sendStatus(500);
    }
}

module.exports = {
    atualizarSea,
    atualizarSeaMassa,
};
