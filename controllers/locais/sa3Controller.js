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


// Controller para atualizar a tabela SA3010
async function atualizarSa3(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SA3/banco`, {
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
            const { A3_FILIAL, A3_COD, A3_NOME, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_, A3_NREDUZ, A3_XSETOR} = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SA3010 WHERE A3_FILIAL = ${A3_FILIAL} AND A3_COD = ${A3_COD}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`
                    UPDATE SA3010 SET
                        A3_FILIAL = ${A3_FILIAL},
                        A3_COD    = ${A3_COD},
                        A3_NOME   = ${A3_NOME},
                        S_T_A_M_P_ = ${S_T_A_M_P_}, 
                        R_E_C_N_O_ = ${R_E_C_N_O_}, 
                        R_E_C_D_E_L_ = ${R_E_C_D_E_L_},
                        A3_NREDUZ = ${A3_NREDUZ},
                        A3_XSETOR = ${A3_XSETOR}
                    WHERE 
                        A3_FILIAL = ${A3_FILIAL} AND A3_COD = ${A3_COD}
                `;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`
                    INSERT INTO SA3010 
                        (A3_FILIAL, A3_COD, A3_NOME, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_, A3_NREDUZ, A3_XSETOR) 
                    VALUES 
                        (${A3_FILIAL}, ${A3_COD}, ${A3_NOME}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_}, ${A3_NREDUZ}, ${A3_XSETOR})
                `;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SA3010', ${getCurrentSQLServerDateTime()}, 200)
        `;
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SA3010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})
        `;
        console.log(error);
        res.sendStatus(200);
    }
}

// Controller para atualizar a tabela SA3010 em massa
async function atualizarSa3Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SA3/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SA3010`;

        // Criar uma matriz de promessas para inserir registros
        const promises = notas.data.objects.map(async element => {
            const { A3_FILIAL,A3_COD, A3_NOME, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_, A3_NREDUZ, A3_XSETOR } = element;
            await sql.query`
                INSERT INTO SA3010 
                    (A3_FILIAL, A3_COD, A3_NOME, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_, A3_NREDUZ, A3_XSETOR) 
                VALUES 
                    (${A3_FILIAL}, ${A3_COD}, ${A3_NOME}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_}, ${A3_NREDUZ}, ${A3_XSETOR})
            `;
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SA3010M', ${getCurrentSQLServerDateTime()}, 200)
        `;

        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SA3010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})
        `;
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
        await atualizarSa3Massa();
        refreshed = false;
    } else if (hours !== 0 || minutes > 55) {
        refreshed = true;
        await atualizarSa3();
    }
}

// Executar a verificação a cada 30 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarSa3,
    atualizarSa3Massa
};