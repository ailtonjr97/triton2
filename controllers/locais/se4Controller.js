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

async function atualizarSe4(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SE4/banco`, {
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
            const { E4_FILIAL, E4_CODIGO, E4_DESCRI, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SE4010 WHERE E4_FILIAL = ${E4_FILIAL} AND E4_CODIGO = ${E4_CODIGO}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE SE4010 SET 
                E4_FILIAL = ${E4_FILIAL}, 
                E4_CODIGO = ${E4_CODIGO}, 
                E4_DESCRI = ${E4_DESCRI}, 
                S_T_A_M_P_ = ${S_T_A_M_P_}, 
                R_E_C_N_O_ = ${R_E_C_N_O_}, 
                R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                WHERE E4_FILIAL = ${E4_FILIAL} AND E4_CODIGO = ${E4_CODIGO}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO SE4010 (
                    E4_FILIAL, 
                    E4_CODIGO, 
                    E4_DESCRI, 
                    S_T_A_M_P_, 
                    R_E_C_N_O_, 
                    R_E_C_D_E_L_
                ) VALUES (
                    ${E4_FILIAL}, 
                    ${E4_CODIGO}, 
                    ${E4_DESCRI},
                    ${S_T_A_M_P_}, 
                    ${R_E_C_N_O_}, 
                    ${R_E_C_D_E_L_}
                 )`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SE4010', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SE4010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error);
        res.sendStatus(200);
    }
}

async function atualizarSe4Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SE4/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SE4010`

        // Função para inserir registros em lotes de mil
        const batchSize = 1000;
        for (let i = 0; i < notas.data.objects.length; i += batchSize) {
            const batch = notas.data.objects.slice(i, i + batchSize);

            const promises = batch.map(async element => {
                const { E4_FILIAL, E4_CODIGO, E4_DESCRI, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;
                await sql.query`INSERT INTO SE4010 ( E4_FILIAL, E4_CODIGO, E4_DESCRI, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ ) 
                VALUES (${E4_FILIAL}, ${E4_CODIGO}, ${E4_DESCRI}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
            });

            // Esperar a conclusão das inserções do lote atual antes de continuar
            await Promise.all(promises);
        }

        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SE4010M', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SE4010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error);
        res.sendStatus(500);
    }
}

module.exports = { 
    atualizarSe4,
    atualizarSe4Massa
};