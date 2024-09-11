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

async function atualizarSb1(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SB1/banco`, {
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
            const { B1_FILIAL, B1_COD, B1_DESC, B1_TIPO, B1_UM, B1_PESO, B1_PESBRU, B1_CODBAR, B1_CODGTIN, B1_IMPORT, B1_IPI, B1_ORIGEM, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SB1010 WHERE B1_FILIAL = ${B1_FILIAL} AND B1_COD = ${B1_COD}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE SB1010 SET 
                B1_FILIAL = ${B1_FILIAL}, 
                B1_COD = ${B1_COD}, 
                B1_DESC = ${B1_DESC}, 
                B1_TIPO = ${B1_TIPO}, 
                B1_UM = ${B1_UM},
                B1_PESO = ${B1_PESO},
                B1_PESBRU = ${B1_PESBRU},
                B1_CODBAR = ${B1_CODBAR},
                B1_CODGTIN = ${B1_CODGTIN},
                B1_IMPORT = ${B1_IMPORT},
                B1_IPI = ${B1_IPI},
                B1_ORIGEM = ${B1_ORIGEM},
                S_T_A_M_P_ = ${S_T_A_M_P_}, 
                R_E_C_N_O_ = ${R_E_C_N_O_}, 
                R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                WHERE B1_FILIAL = ${B1_FILIAL} AND B1_COD = ${B1_COD}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO SB1010 (
                    B1_FILIAL, 
                    B1_COD, 
                    B1_DESC, 
                    B1_TIPO, 
                    B1_UM, 
                    B1_PESO, 
                    B1_PESBRU, 
                    B1_CODBAR, 
                    B1_CODGTIN, 
                    B1_IMPORT, 
                    B1_IPI, 
                    B1_ORIGEM, 
                    S_T_A_M_P_, 
                    R_E_C_N_O_, 
                    R_E_C_D_E_L_
                ) VALUES (
                    ${B1_FILIAL}, 
                    ${B1_COD}, 
                    ${B1_DESC}, 
                    ${B1_TIPO}, 
                    ${B1_UM},
                    ${B1_PESO}, 
                    ${B1_PESBRU}, 
                    ${B1_CODBAR}, 
                    ${B1_CODGTIN}, 
                    ${B1_IMPORT}, 
                    ${B1_IPI}, 
                    ${B1_ORIGEM},  
                    ${S_T_A_M_P_}, 
                    ${R_E_C_N_O_}, 
                    ${R_E_C_D_E_L_}
                 )`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SB1010', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SB1010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        res.sendStatus(200);
    }
}

async function atualizarSb1Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SB1/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SB1010`

        // Função para inserir registros em lotes de mil
        const batchSize = 1000;
        for (let i = 0; i < notas.data.objects.length; i += batchSize) {
            console.log(batchSize)
            const batch = notas.data.objects.slice(i, i + batchSize);

            const promises = batch.map(async element => {
                const { B1_FILIAL, B1_COD, B1_DESC, B1_TIPO, B1_UM, B1_PESO, B1_PESBRU, B1_CODBAR, B1_CODGTIN, B1_IMPORT, B1_IPI, B1_ORIGEM, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;
                await sql.query`INSERT INTO SB1010 ( B1_FILIAL, B1_COD, B1_DESC, B1_TIPO, B1_UM, B1_PESO, B1_PESBRU, B1_CODBAR, B1_CODGTIN, B1_IMPORT, B1_IPI, B1_ORIGEM, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ ) 
                VALUES (${B1_FILIAL}, ${B1_COD}, ${B1_DESC}, ${B1_TIPO}, ${B1_UM}, ${B1_PESO}, ${B1_PESBRU}, ${B1_CODBAR}, ${B1_CODGTIN}, ${B1_IMPORT}, ${B1_IPI}, ${B1_ORIGEM}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
            });

            // Esperar a conclusão das inserções do lote atual antes de continuar
            await Promise.all(promises);
        }

        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SB1010M', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SB1010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error)
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
        await atualizarSb1Massa();
        refreshed = false;
    } else if (hours !== 0 || minutes > 55) {
        refreshed = true;
        await atualizarSb1();
    }
}

// Executar a verificação a cada 2 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarSb1,
    atualizarSb1Massa
};