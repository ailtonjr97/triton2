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

async function atualizarDa1(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_DA1/banco`, {
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
            const { DA1_FILIAL, DA1_CODTAB, DA1_ITEM, DA1_CODPRO, DA1_PRCVEN, DA1_ATIVO, DA1_QTDLOT, DA1_DATVIG, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM DA1010 WHERE DA1_FILIAL = ${DA1_FILIAL} AND DA1_CODTAB = ${DA1_CODTAB} AND DA1_ITEM = ${DA1_ITEM} AND DA1_CODPRO = ${DA1_CODPRO}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE DA1010 SET 
                DA1_FILIAL = ${DA1_FILIAL}, 
                DA1_CODTAB = ${DA1_CODTAB}, 
                DA1_ITEM   = ${DA1_ITEM},
                DA1_CODPRO = ${DA1_CODPRO},
                DA1_PRCVEN = ${DA1_PRCVEN},
                DA1_ATIVO  = ${DA1_ATIVO},
                DA1_QTDLOT = ${DA1_QTDLOT},
                DA1_DATVIG = ${DA1_DATVIG},
                S_T_A_M_P_ = ${S_T_A_M_P_}, 
                R_E_C_N_O_ = ${R_E_C_N_O_}, 
                R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                WHERE DA1_FILIAL = ${DA1_FILIAL} AND DA1_CODTAB = ${DA1_CODTAB} AND DA1_ITEM = ${DA1_ITEM} AND DA1_CODPRO = ${DA1_CODPRO}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO DA1010 (
                    DA1_FILIAL,
                    DA1_CODTAB,
                    DA1_ITEM,
                    DA1_CODPRO,
                    DA1_PRCVEN,
                    DA1_ATIVO,
                    DA1_QTDLOT,
                    DA1_DATVIG,
                    S_T_A_M_P_,
                    R_E_C_N_O_, 
                    R_E_C_D_E_L_
                ) VALUES (
                    ${DA1_FILIAL}, 
                    ${DA1_CODTAB},
                    ${DA1_ITEM},
                    ${DA1_CODPRO},
                    ${DA1_PRCVEN},
                    ${DA1_ATIVO},
                    ${DA1_QTDLOT},
                    ${DA1_DATVIG},
                    ${S_T_A_M_P_}, 
                    ${R_E_C_N_O_}, 
                    ${R_E_C_D_E_L_}
                 )`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('DA1010', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('DA1010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error);
        res.sendStatus(200);
    }
}

async function atualizarDa1Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_DA1/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE DA1010`

        // Função para inserir registros em lotes de mil
        const batchSize = 1000;
        for (let i = 0; i < notas.data.objects.length; i += batchSize) {
            const batch = notas.data.objects.slice(i, i + batchSize);

            const promises = batch.map(async element => {
                const { DA1_FILIAL, DA1_CODTAB, DA1_ITEM, DA1_CODPRO, DA1_PRCVEN, DA1_ATIVO, DA1_QTDLOT, DA1_DATVIG, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_} = element;
                await sql.query`INSERT INTO DA1010 ( DA1_FILIAL, DA1_CODTAB, DA1_ITEM, DA1_CODPRO, DA1_PRCVEN, DA1_ATIVO, DA1_QTDLOT, DA1_DATVIG, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_) 
                VALUES (${DA1_FILIAL}, ${DA1_CODTAB}, ${DA1_ITEM}, ${DA1_CODPRO}, ${DA1_PRCVEN}, ${DA1_ATIVO}, ${DA1_QTDLOT}, ${DA1_DATVIG}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
            });

            // Esperar a conclusão das inserções do lote atual antes de continuar
            await Promise.all(promises);
        }

        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('DA1010M', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('DA1010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error);
        res.sendStatus(500);
    }
}

module.exports = { 
    atualizarDa1,
    atualizarDa1Massa
};