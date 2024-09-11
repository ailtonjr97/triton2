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

    const pad = (number) => number < 10 ? '0' + number : number;

    const year = jsDate.getFullYear();
    const month = pad(jsDate.getMonth() + 1);
    const day = pad(jsDate.getDate());
    const hours = pad(jsDate.getHours());
    const minutes = pad(jsDate.getMinutes());
    const seconds = pad(jsDate.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function atualizarSc1(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SC1/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Criar uma matriz de promessas para verificar e atualizar/inserir registros
        const promises = notas.data.objects.map(async element => {
            const { C1_FILIAL, C1_NUM, C1_ITEM, C1_PRODUTO, C1_DESCRI, C1_QUANT, C1_OBS, C1_SOLICIT, C1_EMISSAO, C1_ITEMGRD, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SC1010 WHERE C1_FILIAL = ${C1_FILIAL} AND C1_NUM = ${C1_NUM} AND C1_ITEM = ${C1_ITEM} AND C1_ITEMGRD = ${C1_ITEMGRD}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE SC1010 SET 
                C1_FILIAL = ${C1_FILIAL}, 
                C1_NUM = ${C1_NUM},
                C1_ITEM = ${C1_ITEM},
                C1_PRODUTO = ${C1_PRODUTO},
                C1_DESCRI = ${C1_DESCRI},
                C1_QUANT = ${C1_QUANT},
                C1_OBS = ${C1_OBS},
                C1_SOLICIT = ${C1_SOLICIT},
                C1_EMISSAO = ${C1_EMISSAO},
                C1_ITEMGRD = ${C1_ITEMGRD},
                S_T_A_M_P_ = ${S_T_A_M_P_}, 
                R_E_C_N_O_ = ${R_E_C_N_O_}, 
                R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                WHERE C1_FILIAL = ${C1_FILIAL} AND C1_NUM = ${C1_NUM} AND C1_ITEM = ${C1_ITEM} AND C1_ITEMGRD = ${C1_ITEMGRD}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO SC1010 (
                    C1_FILIAL, 
                    C1_NUM,
                    C1_ITEM,
                    C1_PRODUTO,
                    C1_DESCRI,
                    C1_QUANT,
                    C1_OBS,
                    C1_SOLICIT,
                    C1_EMISSAO,
                    C1_ITEMGRD,
                    S_T_A_M_P_, 
                    R_E_C_N_O_, 
                    R_E_C_D_E_L_
                ) VALUES (
                    ${C1_FILIAL}, 
                    ${C1_NUM},
                    ${C1_ITEM},
                    ${C1_PRODUTO},
                    ${C1_DESCRI},
                    ${C1_QUANT},
                    ${C1_OBS},
                    ${C1_SOLICIT},
                    ${C1_EMISSAO},
                    ${C1_ITEMGRD},
                    ${S_T_A_M_P_}, 
                    ${R_E_C_N_O_}, 
                    ${R_E_C_D_E_L_}
                 )`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SC1010', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SC1010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error);
        res.sendStatus(200);
    }
}

async function atualizarSc1Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SC1/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SC1010`

        // Função para inserir registros em lotes de mil
        const batchSize = 1000;
        for (let i = 0; i < notas.data.objects.length; i += batchSize) {
            const batch = notas.data.objects.slice(i, i + batchSize);

            const promises = batch.map(async element => {
                const { C1_FILIAL, C1_NUM, C1_ITEM, C1_PRODUTO, C1_DESCRI, C1_QUANT, C1_OBS, C1_SOLICIT, C1_EMISSAO, C1_ITEMGRD, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;
                await sql.query`INSERT INTO SC1010 ( C1_FILIAL, C1_NUM, C1_ITEM, C1_PRODUTO, C1_DESCRI, C1_QUANT, C1_OBS, C1_SOLICIT, C1_EMISSAO, C1_ITEMGRD, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ ) 
                VALUES (${C1_FILIAL}, ${C1_NUM}, ${C1_ITEM}, ${C1_PRODUTO}, ${C1_DESCRI}, ${C1_QUANT}, ${C1_OBS}, ${C1_SOLICIT}, ${C1_EMISSAO}, ${C1_ITEMGRD}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
            });

            // Esperar a conclusão das inserções do lote atual antes de continuar
            await Promise.all(promises);
        }

        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SC1010M', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SC1010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error);
        res.sendStatus(500);
    }
}

let refreshed = true;

async function verificarHorario() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Verificar se o horário do update em massa
    if (hours === 0 && minutes <= 55 && refreshed) {
        await atualizarSc1Massa();
        refreshed = false;
    } else if (hours !== 0 || minutes > 55) {
        refreshed = true;
        await atualizarSc1();
    }
}

// Executar a verificação a cada 2 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarSc1,
    atualizarSc1Massa
};