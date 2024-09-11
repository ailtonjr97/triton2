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
    const hours = pad(jsDate.getHours() - 1);
    const minutes = pad(jsDate.getMinutes());
    const seconds = pad(jsDate.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function atualizarSa1(req, res) {
    try {
        const updated_at = getCurrentSQLServerDateTime();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SA1/banco`, {
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
            const { A1_FILIAL, A1_COD, A1_LOJA, A1_NOME, A1_CGC, A1_END, A1_CODMUN, A1_MUN, A1_EST, A1_CEP, A1_XCARTEI, A1_GRPVEN, A1_VEND, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SA1010 WHERE A1_FILIAL = ${A1_FILIAL} AND A1_COD = ${A1_COD} AND A1_LOJA = ${A1_LOJA}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE SA1010 SET A1_FILIAL = ${A1_FILIAL}, A1_COD = ${A1_COD}, A1_LOJA = ${A1_LOJA}, A1_NOME = ${A1_NOME}, A1_CGC = ${A1_CGC}, A1_END = ${A1_END}, A1_CODMUN = ${A1_CODMUN}, 
                A1_MUN = ${A1_MUN}, A1_EST = ${A1_EST}, A1_CEP = ${A1_CEP}, A1_XCARTEI = ${A1_XCARTEI}, A1_GRPVEN = ${A1_GRPVEN}, A1_VEND = ${A1_VEND}, S_T_A_M_P_ = ${S_T_A_M_P_}, R_E_C_N_O_ = ${R_E_C_N_O_}, R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                                 WHERE A1_FILIAL = ${A1_FILIAL} AND A1_COD = ${A1_COD} AND A1_LOJA = ${A1_LOJA}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO SA1010 (A1_FILIAL, A1_COD, A1_LOJA, A1_NOME, A1_CGC, A1_END, A1_CODMUN, A1_MUN, A1_EST, A1_CEP, A1_XCARTEI, A1_GRPVEN, A1_VEND, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_) VALUES (${A1_FILIAL}, ${A1_COD}, ${A1_LOJA}, ${A1_NOME}, ${A1_CGC}, ${A1_END}, ${A1_CODMUN}, ${A1_MUN}, ${A1_EST}, ${A1_CEP}, ${A1_XCARTEI}, ${A1_GRPVEN}, ${A1_VEND}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SA1010', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SA1010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        res.sendStatus(200);
    }
}

async function atualizarSa1Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SA1/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        //Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SA1010`

        // Criar uma matriz de promessas para verificar e atualizar/inserir registros
        const promises = notas.data.objects.map(async element => {
            const { A1_FILIAL, A1_COD, A1_LOJA, A1_NOME, A1_CGC, A1_END, A1_CODMUN, A1_MUN, A1_EST, A1_CEP, A1_XCARTEI, A1_GRPVEN, A1_VEND, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;
            await sql.query`INSERT INTO SA1010 (A1_FILIAL, A1_COD, A1_LOJA, A1_NOME, A1_CGC, A1_END, A1_CODMUN, A1_MUN, A1_EST, A1_CEP, A1_XCARTEI, A1_GRPVEN, A1_VEND, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_) VALUES (${A1_FILIAL}, ${A1_COD}, ${A1_LOJA}, ${A1_NOME}, ${A1_CGC}, ${A1_END}, ${A1_CODMUN}, ${A1_MUN}, ${A1_EST}, ${A1_CEP}, ${A1_XCARTEI}, ${A1_GRPVEN}, ${A1_VEND}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SA1010M', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SA1010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
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
    if (hours === 3 && refreshed) {
        await atualizarSa1Massa();
        refreshed = false;
    } else if (hours !== 3 || minutes > 30) {
        refreshed = true;
        await atualizarSa1();
    }
}

// Executar a verificação a cada 2 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarSa1,
    atualizarSa1Massa
};