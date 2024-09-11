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


// Controller para atualizar a tabela SCK010
async function atualizarSck(req, res) {
    try {
        const updated_at = getCurrentDateString();

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SCK/banco`, {
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
            const { CK_FILIAL, CK_ITEM, CK_PRODUTO, CK_UM, CK_QTDVEN, CK_NUM, CK_PRCVEN, CK_VALOR, CK_OPER, CK_TES, CK_LOJA, CK_DESCONT, CK_VALDESC, CK_PEDCLI, CK_DESCRI, CK_PRUNIT, CK_NUMPV, CK_OBS, CK_ENTREG, CK_COTCLI, CK_ITECLI, CK_OPC, CK_CLASFIS, CK_FILVEN, CK_FILENT, CK_CONTRAT, CK_PROJPMS, CK_EDTPMS, CK_TASKPMS, CK_COMIS1, CK_PROPOST, CK_ITEMPRO, CK_NVERPMS, CK_DT1VEN, CK_ITEMGRD, CK_TPPROD, CK_FCICOD, CK_VLIMPOR, CK_MOPC, CK_XPRAZIN, CK_XENTREG, CK_XROTINA, CK_XPEDCOM, CK_XITPCOM, CK_XMOTPRC } = element;

            // Verificar se o registro existe
            const result = await sql.query`SELECT * FROM SCK010 WHERE CK_FILIAL = ${CK_FILIAL} AND CK_NUM = ${CK_NUM} AND CK_ITEM = ${CK_ITEM} AND CK_PRODUTO = ${CK_PRODUTO}`;

            if (result.recordset.length > 0) {
                // Registro existe, realizar o update
                await sql.query`
                    UPDATE SCK010 SET
                        CK_FILIAL = ${CK_FILIAL},
                        CK_ITEM = ${CK_ITEM},
                        CK_PRODUTO = ${CK_PRODUTO}, 
                        CK_UM = ${CK_UM}, 
                        CK_QTDVEN = ${CK_QTDVEN},
                        CK_NUM = ${CK_NUM},
                        CK_PRCVEN = ${CK_PRCVEN},
                        CK_VALOR = ${CK_VALOR},
                        CK_OPER = ${CK_OPER},
                        CK_TES = ${CK_TES},
                        CK_LOJA = ${CK_LOJA},
                        CK_DESCONT = ${CK_DESCONT},
                        CK_VALDESC = ${CK_VALDESC},
                        CK_PEDCLI = ${CK_PEDCLI},
                        CK_DESCRI = ${CK_DESCRI},
                        CK_PRUNIT = ${CK_PRUNIT},
                        CK_NUMPV = ${CK_NUMPV},
                        CK_OBS = ${CK_OBS},
                        CK_ENTREG = ${CK_ENTREG},
                        CK_COTCLI = ${CK_COTCLI},
                        CK_ITECLI = ${CK_ITECLI},
                        CK_OPC = ${CK_OPC},
                        CK_CLASFIS = ${CK_CLASFIS},
                        CK_FILVEN = ${CK_FILVEN},
                        CK_FILENT = ${CK_FILENT},
                        CK_CONTRAT = ${CK_CONTRAT},
                        CK_PROJPMS = ${CK_PROJPMS},
                        CK_EDTPMS = ${CK_EDTPMS},
                        CK_TASKPMS = ${CK_TASKPMS},
                        CK_COMIS1 = ${CK_COMIS1},
                        CK_PROPOST = ${CK_PROPOST},
                        CK_ITEMPRO = ${CK_ITEMPRO},
                        CK_NVERPMS = ${CK_NVERPMS},
                        CK_DT1VEN = ${CK_DT1VEN},
                        CK_ITEMGRD = ${CK_ITEMGRD},
                        CK_TPPROD = ${CK_TPPROD},
                        CK_FCICOD = ${CK_FCICOD},
                        CK_VLIMPOR = ${CK_VLIMPOR},
                        CK_MOPC = ${CK_MOPC},
                        CK_XPRAZIN = ${CK_XPRAZIN},
                        CK_XENTREG = ${CK_XENTREG},
                        CK_XROTINA = ${CK_XROTINA},
                        CK_XPEDCOM = ${CK_XPEDCOM},
                        CK_XITPCOM = ${CK_XITPCOM},
                        CK_XMOTPRC = ${CK_XMOTPRC}
                    WHERE 
                        CK_FILIAL = ${CK_FILIAL} AND 
                        CK_ITEM = ${CK_ITEM} AND
                        CK_NUM = ${CK_NUM} AND
                        CK_PRODUTO = ${CK_PRODUTO}
                `;
            } else {
                // Registro não existe, realizar o insert
                await sql.query`
                    INSERT INTO SCK010 
                        (CK_FILIAL, CK_ITEM, CK_PRODUTO, CK_UM, CK_QTDVEN, CK_NUM, CK_PRCVEN, CK_VALOR, CK_OPER, CK_TES, CK_LOJA, CK_DESCONT, CK_VALDESC, CK_PEDCLI, CK_DESCRI, CK_PRUNIT, CK_NUMPV, CK_OBS, CK_ENTREG, CK_COTCLI, CK_ITECLI, CK_OPC, CK_CLASFIS, CK_FILVEN, CK_FILENT, CK_CONTRAT, CK_PROJPMS, CK_EDTPMS, CK_TASKPMS, CK_COMIS1, CK_PROPOST, CK_ITEMPRO, CK_NVERPMS, CK_DT1VEN, CK_ITEMGRD, CK_TPPROD, CK_FCICOD, CK_VLIMPOR, CK_MOPC, CK_XPRAZIN, CK_XENTREG, CK_XROTINA, CK_XPEDCOM, CK_XITPCOM, CK_XMOTPRC) 
                    VALUES 
                        (${CK_FILIAL}, ${CK_ITEM}, ${CK_PRODUTO}, ${CK_UM}, ${CK_QTDVEN}, ${CK_NUM}, ${CK_PRCVEN}, ${CK_VALOR}, ${CK_OPER}, ${CK_TES}, ${CK_LOJA}, ${CK_DESCONT}, ${CK_VALDESC}, ${CK_PEDCLI}, ${CK_DESCRI}, ${CK_PRUNIT}, ${CK_NUMPV}, ${CK_OBS}, ${CK_ENTREG}, ${CK_COTCLI}, ${CK_ITECLI}, ${CK_OPC}, ${CK_CLASFIS}, ${CK_FILVEN}, ${CK_FILENT}, ${CK_CONTRAT}, ${CK_PROJPMS}, ${CK_EDTPMS}, ${CK_TASKPMS}, ${CK_COMIS1}, ${CK_PROPOST}, ${CK_ITEMPRO}, ${CK_NVERPMS}, ${CK_DT1VEN}, ${CK_ITEMGRD}, ${CK_TPPROD}, ${CK_FCICOD}, ${CK_VLIMPOR}, ${CK_MOPC}, ${CK_XPRAZIN}, ${CK_XENTREG}, ${CK_XROTINA}, ${CK_XPEDCOM}, ${CK_XITPCOM}, ${CK_XMOTPRC})
                `;
            }
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SCK010', ${getCurrentSQLServerDateTime()}, 200)
        `;
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SCK010', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})
        `;
        console.log(error);
        res.sendStatus(200);
    }
}

// Controller para atualizar a tabela SCK010 em massa
async function atualizarSckMassa(req, res) {
    try {
        const updated_at = '';

        // Obter as notas da API
        const notas = await axios.get(`${process.env.APITOTVS}CONSULTA_SCK/banco`, {
            params: { updated_at },
            auth: {
                username: process.env.USERTOTVS,
                password: process.env.SENHAPITOTVS
            }
        });

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SCK010`;

        // Criar uma matriz de promessas para inserir registros
        const promises = notas.data.objects.map(async element => {
            const { CK_FILIAL, CK_ITEM, CK_PRODUTO, CK_UM, CK_QTDVEN, CK_NUM, CK_PRCVEN, CK_VALOR, CK_OPER, CK_TES, CK_LOJA, CK_DESCONT, CK_VALDESC, CK_PEDCLI, CK_DESCRI, CK_PRUNIT, CK_NUMPV, CK_OBS, CK_ENTREG, CK_COTCLI, CK_ITECLI, CK_OPC, CK_CLASFIS, CK_FILVEN, CK_FILENT, CK_CONTRAT, CK_PROJPMS, CK_EDTPMS, CK_TASKPMS, CK_COMIS1, CK_PROPOST, CK_ITEMPRO, CK_NVERPMS, CK_DT1VEN, CK_ITEMGRD, CK_TPPROD, CK_FCICOD, CK_VLIMPOR, CK_MOPC, CK_XPRAZIN, CK_XENTREG, CK_XROTINA, CK_XPEDCOM, CK_XITPCOM, CK_XMOTPRC } = element;
            await sql.query`
                INSERT INTO SCK010 
                    (CK_FILIAL, CK_ITEM, CK_PRODUTO, CK_UM, CK_QTDVEN, CK_NUM, CK_PRCVEN, CK_VALOR, CK_OPER, CK_TES, CK_LOJA, CK_DESCONT, CK_VALDESC, CK_PEDCLI, CK_DESCRI, CK_PRUNIT, CK_NUMPV, CK_OBS, CK_ENTREG, CK_COTCLI, CK_ITECLI, CK_OPC, CK_CLASFIS, CK_FILVEN, CK_FILENT, CK_CONTRAT, CK_PROJPMS, CK_EDTPMS, CK_TASKPMS, CK_COMIS1, CK_PROPOST, CK_ITEMPRO, CK_NVERPMS, CK_DT1VEN, CK_ITEMGRD, CK_TPPROD, CK_FCICOD, CK_VLIMPOR, CK_MOPC, CK_XPRAZIN, CK_XENTREG, CK_XROTINA, CK_XPEDCOM, CK_XITPCOM, CK_XMOTPRC) 
                VALUES 
                    (${CK_FILIAL}, ${CK_ITEM}, ${CK_PRODUTO}, ${CK_UM}, ${CK_QTDVEN}, ${CK_NUM}, ${CK_PRCVEN}, ${CK_VALOR}, ${CK_OPER}, ${CK_TES}, ${CK_LOJA}, ${CK_DESCONT}, ${CK_VALDESC}, ${CK_PEDCLI}, ${CK_DESCRI}, ${CK_PRUNIT}, ${CK_NUMPV}, ${CK_OBS}, ${CK_ENTREG}, ${CK_COTCLI}, ${CK_ITECLI}, ${CK_OPC}, ${CK_CLASFIS}, ${CK_FILVEN}, ${CK_FILENT}, ${CK_CONTRAT}, ${CK_PROJPMS}, ${CK_EDTPMS}, ${CK_TASKPMS}, ${CK_COMIS1}, ${CK_PROPOST}, ${CK_ITEMPRO}, ${CK_NVERPMS}, ${CK_DT1VEN}, ${CK_ITEMGRD}, ${CK_TPPROD}, ${CK_FCICOD}, ${CK_VLIMPOR}, ${CK_MOPC}, ${CK_XPRAZIN}, ${CK_XENTREG}, ${CK_XROTINA}, ${CK_XPEDCOM}, ${CK_XITPCOM}, ${CK_XMOTPRC})
            `;
        });

        // Esperar a conclusão de todas as promessas
        await Promise.all(promises);
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SCK010M', ${getCurrentSQLServerDateTime()}, 200)
        `;

        res.sendStatus(200)
    } catch (error) {
        await connectToDatabase();
        await sql.query`
            INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) 
            VALUES ('SCK010M', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})
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
    if (hours === 0 && minutes > 55 && refreshed) {
        await atualizarSckMassa();
        refreshed = false;
    } else if (hours !== 0 || minutes > 55) {
        refreshed = true;
        await atualizarSck();
    }
}

// Executar a verificação a cada 2 minutos
setInterval(verificarHorario, 1800000);

module.exports = { 
    atualizarSck,
    atualizarSckMassa
};