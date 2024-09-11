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

async function atualizarSd2(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SD2/banco`, {
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
            const { D2_FILIAL, D2_DOC, D2_CLASFIS, D2_PEDIDO, D2_CF, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SD2010 WHERE D2_FILIAL = ${D2_FILIAL} AND D2_DOC = ${D2_DOC}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE SD2010 SET D2_FILIAL = ${D2_FILIAL}, D2_DOC = ${D2_DOC}, D2_CLASFIS = ${D2_CLASFIS}, D2_PEDIDO = ${D2_PEDIDO}, D2_CF = ${D2_CF}, S_T_A_M_P_ = ${S_T_A_M_P_}, R_E_C_N_O_ = ${R_E_C_N_O_}, R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                                WHERE D2_FILIAL = ${D2_FILIAL} AND D2_DOC = ${D2_DOC}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO SD2010 (D2_FILIAL, D2_DOC, D2_CLASFIS, D2_PEDIDO, D2_CF, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_) VALUES (${D2_FILIAL}, ${D2_DOC}, ${D2_CLASFIS}, ${D2_PEDIDO}, ${D2_CF}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SD2010', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SD2010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error);
        res.sendStatus(200);
    }
}

async function atualizarSd2Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SD2/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        //Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SD2010`

        // Criar uma matriz de promessas para verificar e atualizar/inserir registros
        const promises = notas.data.objects.map(async element => {
            const { D2_FILIAL, D2_DOC, D2_CLASFIS, D2_PEDIDO, D2_CF, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;
            await sql.query`INSERT INTO SD2010 (D2_FILIAL, D2_DOC, D2_CLASFIS, D2_PEDIDO, D2_CF, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_) VALUES (${D2_FILIAL}, ${D2_DOC}, ${D2_CLASFIS}, ${D2_PEDIDO}, ${D2_CF}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SD2010M', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(500);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SD2010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
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
        await atualizarSd2Massa();
        refreshed = false;
    } else if (hours !== 0 || minutes > 55) {
        refreshed = true;
        await atualizarSd2();
    }
}

// Executar a verificação a cada 2 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarSd2,
    atualizarSd2Massa
};