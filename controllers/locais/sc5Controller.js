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


// Controller para atualizar a tabela SC5010
async function atualizarSc5(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SC5/banco`, {
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
                C5_FILIAL, 
                C5_NUM, 
                C5_XHEXPED, 
                C5_CLIENTE, 
                C5_LOJACLI, 
                S_T_A_M_P_, 
                R_E_C_N_O_, 
                R_E_C_D_E_L_,
                C5_NOTA,
                C5_FECENT,
                C5_CONDPAG,
                C5_VEND1,
                C5_XOBS
            } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SC5010 WHERE C5_FILIAL = ${C5_FILIAL} AND C5_NUM = ${C5_NUM}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`
                    UPDATE SC5010 SET
                        C5_FILIAL    = ${C5_FILIAL},
                        C5_NUM       = ${C5_NUM},
                        C5_XHEXPED   = ${C5_XHEXPED},
                        C5_CLIENTE   = ${C5_CLIENTE},
                        C5_LOJACLI   = ${C5_LOJACLI},
                        S_T_A_M_P_   = ${S_T_A_M_P_}, 
                        R_E_C_N_O_   = ${R_E_C_N_O_}, 
                        R_E_C_D_E_L_ = ${R_E_C_D_E_L_},
                        C5_NOTA    = ${C5_NOTA},
                        C5_FECENT  = ${C5_FECENT},
                        C5_CONDPAG = ${C5_CONDPAG},
                        C5_VEND1   = ${C5_VEND1},
                        C5_XOBS    = ${C5_XOBS} WHERE C5_FILIAL = ${C5_FILIAL} AND C5_NUM = ${C5_NUM}
                `;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`
                    INSERT INTO SC5010 
                    (
                        C5_FILIAL, 
                        C5_NUM, 
                        C5_XHEXPED, 
                        C5_CLIENTE, 
                        C5_LOJACLI, 
                        S_T_A_M_P_, 
                        R_E_C_N_O_, 
                        R_E_C_D_E_L_,
                        C5_NOTA,
                        C5_FECENT,
                        C5_CONDPAG,
                        C5_VEND1,
                        C5_XOBS
                    ) 
                    VALUES 
                    (
                        ${C5_FILIAL}, 
                        ${C5_NUM}, 
                        ${C5_XHEXPED}, 
                        ${C5_CLIENTE}, 
                        ${C5_LOJACLI}, 
                        ${S_T_A_M_P_}, 
                        ${R_E_C_N_O_}, 
                        ${R_E_C_D_E_L_},
                        ${C5_NOTA}, 
                        ${C5_FECENT}, 
                        ${C5_CONDPAG}, 
                        ${C5_VEND1}, 
                        ${C5_XOBS}
                    )
                `;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SC5010', ${getCurrentSQLServerDateTime()}, 200)
        `;
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS, MENSAGEM) 
            VALUES ('SC5010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500}, ${error.response?.statusText || '500'})
        `;
        console.log(error);
        res.sendStatus(200);
    }
}

// Controller para atualizar a tabela SC5010 em massa
async function atualizarSc5Massa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SC5/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SC5010`;

        // Criar uma matriz de promessas para inserir registros
        const promises = notas.data.objects.map(async element => {
            const { 
                C5_FILIAL, 
                C5_NUM, 
                C5_XHEXPED, 
                C5_CLIENTE, 
                C5_LOJACLI, 
                S_T_A_M_P_, 
                R_E_C_N_O_, 
                R_E_C_D_E_L_,
                C5_NOTA,
                C5_FECENT,
                C5_CONDPAG,
                C5_VEND1,
                C5_XOBS
            } = element;
            await sql.query`
                INSERT INTO SC5010 
                (
                    C5_FILIAL, 
                    C5_NUM, 
                    C5_XHEXPED, 
                    C5_CLIENTE, 
                    C5_LOJACLI, 
                    S_T_A_M_P_, 
                    R_E_C_N_O_, 
                    R_E_C_D_E_L_,
                    C5_NOTA,
                    C5_FECENT,
                    C5_CONDPAG,
                    C5_VEND1,
                    C5_XOBS
                ) 
                VALUES 
                (
                    ${C5_FILIAL}, 
                    ${C5_NUM}, 
                    ${C5_XHEXPED}, 
                    ${C5_CLIENTE}, 
                    ${C5_LOJACLI}, 
                    ${S_T_A_M_P_}, 
                    ${R_E_C_N_O_}, 
                    ${R_E_C_D_E_L_},
                    ${C5_NOTA},
                    ${C5_FECENT},
                    ${C5_CONDPAG},
                    ${C5_VEND1},
                    ${C5_XOBS}
                )
            `;
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SC5010M', ${getCurrentSQLServerDateTime()}, 200)
        `;
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS, MENSAGEM) 
            VALUES ('SC5010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500}, ${error.response?.statusText || '500'})
        `;
        console.log(error);
    }
}

let refreshed = true;

async function verificarHorario() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Verificar se o horário do update em massa
    if (hours === 0 && minutes <= 55 && refreshed) {
        await atualizarSc5Massa();
        refreshed = false;
    } else if (hours !== 0 || minutes > 55) {
        refreshed = true;
        await atualizarSc5();
    }
}

// Executar a verificação a cada 30 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarSc5,
    atualizarSc5Massa
};