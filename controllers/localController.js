const axios = require('axios');
const { sql, connectToDatabase } = require('../services/dbConfig.js');

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

async function atualizarScj(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SCJ/banco`, {
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
            const {
                CJ_FILIAL,
                CJ_NUM,
                S_T_A_M_P_,
                R_E_C_N_O_,
                R_E_C_D_E_L_,
                CJ_EMISSAO,
                CJ_PROSPE,
                CJ_LOJPRO,
                CJ_CLIENTE,
                CJ_LOJA,
                CJ_CLIENT,
                CJ_LOJAENT,
                CJ_CONDPAG,
                CJ_XESTADO,
                CJ_XPVKORP,
                CJ_TABELA,
                CJ_CST_FTS,
                CJ_TIPOCLI,
                CJ_TPFRETE,
                CJ_XFREMA,
                CJ_XFREIMP,
                CJ_XFRESIM,
                CJ_XTRANSP,
                CJ_TIPLIB,
                CJ_DESC3
            } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SCJ010 WHERE CJ_FILIAL = ${CJ_FILIAL} AND CJ_NUM = ${CJ_NUM}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`
                UPDATE SCJ010
                SET CJ_FILIAL = ${CJ_FILIAL},
                    CJ_NUM = ${CJ_NUM},
                    S_T_A_M_P_ = ${S_T_A_M_P_},
                    R_E_C_N_O_ = ${R_E_C_N_O_},
                    R_E_C_D_E_L_ = ${R_E_C_D_E_L_},
                    CJ_EMISSAO = ${CJ_EMISSAO},
                    CJ_PROSPE = ${CJ_PROSPE},
                    CJ_LOJPRO = ${CJ_LOJPRO},
                    CJ_CLIENTE = ${CJ_CLIENTE},
                    CJ_LOJA = ${CJ_LOJA},
                    CJ_CLIENT = ${CJ_CLIENT},
                    CJ_LOJAENT = ${CJ_LOJAENT},
                    CJ_CONDPAG = ${CJ_CONDPAG},
                    CJ_XESTADO = ${CJ_XESTADO},
                    CJ_XPVKORP = ${CJ_XPVKORP},
                    CJ_TABELA = ${CJ_TABELA},
                    CJ_CST_FTS = ${CJ_CST_FTS},
                    CJ_TIPOCLI = ${CJ_TIPOCLI},
                    CJ_TPFRETE = ${CJ_TPFRETE},
                    CJ_XFREMA = ${CJ_XFREMA},
                    CJ_XFREIMP = ${CJ_XFREIMP},
                    CJ_XFRESIM = ${CJ_XFRESIM},
                    CJ_XTRANSP = ${CJ_XTRANSP},
                    CJ_TIPLIB = ${CJ_TIPLIB},
                    CJ_DESC3 = ${CJ_DESC3}
                WHERE CJ_FILIAL = ${CJ_FILIAL}
                  AND CJ_NUM = ${CJ_NUM};
            `;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`
                INSERT INTO SCJ010 (
                    CJ_FILIAL,
                    CJ_NUM,
                    S_T_A_M_P_,
                    R_E_C_N_O_,
                    R_E_C_D_E_L_,
                    CJ_EMISSAO,
                    CJ_PROSPE,
                    CJ_LOJPRO,
                    CJ_CLIENTE,
                    CJ_LOJA,
                    CJ_CLIENT,
                    CJ_LOJAENT,
                    CJ_CONDPAG,
                    CJ_XESTADO,
                    CJ_XPVKORP,
                    CJ_TABELA,
                    CJ_CST_FTS,
                    CJ_TIPOCLI,
                    CJ_TPFRETE,
                    CJ_XFREMA,
                    CJ_XFREIMP,
                    CJ_XFRESIM,
                    CJ_XTRANSP,
                    CJ_TIPLIB,
                    CJ_DESC3
                ) VALUES (
                    ${CJ_FILIAL},
                    ${CJ_NUM},
                    ${S_T_A_M_P_},
                    ${R_E_C_N_O_},
                    ${R_E_C_D_E_L_},
                    ${CJ_EMISSAO},
                    ${CJ_PROSPE},
                    ${CJ_LOJPRO},
                    ${CJ_CLIENTE},
                    ${CJ_LOJA},
                    ${CJ_CLIENT},
                    ${CJ_LOJAENT},
                    ${CJ_CONDPAG},
                    ${CJ_XESTADO},
                    ${CJ_XPVKORP},
                    ${CJ_TABELA},
                    ${CJ_CST_FTS},
                    ${CJ_TIPOCLI},
                    ${CJ_TPFRETE},
                    ${CJ_XFREMA},
                    ${CJ_XFREIMP},
                    ${CJ_XFRESIM},
                    ${CJ_XTRANSP},
                    ${CJ_TIPLIB},
                    ${CJ_DESC3}
                );
                `;

            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SCJ010', ${getCurrentSQLServerDateTime()}, 200)`
    } catch (error) {
        console.log(error)
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SCJ010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
    }
}



async function atualizarScjMassa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SCJ/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SCJ010`

        // Criar uma matriz de promessas para verificar e atualizar/inserir registros
        const promises = notas.data.objects.map(async element => {
            const {
                CJ_FILIAL,
                CJ_NUM,
                S_T_A_M_P_,
                R_E_C_N_O_,
                R_E_C_D_E_L_,
                CJ_EMISSAO,
                CJ_PROSPE,
                CJ_LOJPRO,
                CJ_CLIENTE,
                CJ_LOJA,
                CJ_CLIENT,
                CJ_LOJAENT,
                CJ_CONDPAG,
                CJ_XESTADO,
                CJ_XPVKORP,
                CJ_TABELA,
                CJ_CST_FTS,
                CJ_TIPOCLI,
                CJ_TPFRETE,
                CJ_XFREMA,
                CJ_XFREIMP,
                CJ_XFRESIM,
                CJ_XTRANSP,
                CJ_TIPLIB,
                CJ_DESC3
            } = element;
            await sql.query`
                INSERT INTO SCJ010 (
                    CJ_FILIAL,
                    CJ_NUM,
                    S_T_A_M_P_,
                    R_E_C_N_O_,
                    R_E_C_D_E_L_,
                    CJ_EMISSAO,
                    CJ_PROSPE,
                    CJ_LOJPRO,
                    CJ_CLIENTE,
                    CJ_LOJA,
                    CJ_CLIENT,
                    CJ_LOJAENT,
                    CJ_CONDPAG,
                    CJ_XESTADO,
                    CJ_XPVKORP,
                    CJ_TABELA,
                    CJ_CST_FTS,
                    CJ_TIPOCLI,
                    CJ_TPFRETE,
                    CJ_XFREMA,
                    CJ_XFREIMP,
                    CJ_XFRESIM,
                    CJ_XTRANSP,
                    CJ_TIPLIB,
                    CJ_DESC3
                ) VALUES (
                    ${CJ_FILIAL},
                    ${CJ_NUM},
                    ${S_T_A_M_P_},
                    ${R_E_C_N_O_},
                    ${R_E_C_D_E_L_},
                    ${CJ_EMISSAO},
                    ${CJ_PROSPE},
                    ${CJ_LOJPRO},
                    ${CJ_CLIENTE},
                    ${CJ_LOJA},
                    ${CJ_CLIENT},
                    ${CJ_LOJAENT},
                    ${CJ_CONDPAG},
                    ${CJ_XESTADO},
                    ${CJ_XPVKORP},
                    ${CJ_TABELA},
                    ${CJ_CST_FTS},
                    ${CJ_TIPOCLI},
                    ${CJ_TPFRETE},
                    ${CJ_XFREMA},
                    ${CJ_XFREIMP},
                    ${CJ_XFRESIM},
                    ${CJ_XTRANSP},
                    ${CJ_TIPLIB},
                    ${CJ_DESC3}
                );
            `;
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SCJ010M', ${getCurrentSQLServerDateTime()}, 200)`
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SCJ010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error)
    }
}



async function atualizarSf2(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SF2/banco`, {
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
            const { F2_FILIAL, F2_DOC, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SF2010 WHERE F2_FILIAL = ${F2_FILIAL} AND F2_DOC = ${F2_DOC}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`UPDATE SF2010 SET F2_FILIAL = ${F2_FILIAL}, F2_DOC = ${F2_DOC}, S_T_A_M_P_ = ${S_T_A_M_P_}, R_E_C_N_O_ = ${R_E_C_N_O_}, R_E_C_D_E_L_ = ${R_E_C_D_E_L_}
                                WHERE F2_FILIAL = ${F2_FILIAL} AND F2_DOC = ${F2_DOC}`;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`INSERT INTO SF2010 (F2_FILIAL, F2_DOC, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_) VALUES (${F2_FILIAL}, ${F2_DOC}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SF2010', ${getCurrentSQLServerDateTime()}, 200)`
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SF2010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
    }
}

async function atualizarSf2Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SF2/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        //Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SF2010`

        // Criar uma matriz de promessas para verificar e atualizar/inserir registros
        const promises = notas.data.objects.map(async element => {
            const { F2_FILIAL, F2_DOC, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_ } = element;
            await sql.query`INSERT INTO SF2010 (F2_FILIAL, F2_DOC, S_T_A_M_P_, R_E_C_N_O_, R_E_C_D_E_L_) VALUES (${F2_FILIAL}, ${F2_DOC}, ${S_T_A_M_P_}, ${R_E_C_N_O_}, ${R_E_C_D_E_L_})`;
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SF2010M', ${getCurrentSQLServerDateTime()}, 200)`
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SF2010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error)
    }
}

let refreshed = true;

async function verificarHorario() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Verificar se o horário do update em massa
    if (hours === 0 && minutes <= 5 && refreshed) {
        await atualizarScjMassa();
        await atualizarSf2Massa();
        refreshed = false;
    } else if (hours !== 0 || minutes > 30) {
        refreshed = true;
        await atualizarScj();
        await atualizarSf2();
    }
}

// Executar a verificação a cada 2 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarScj,
    atualizarScjMassa
};