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

async function atualizarSysUsr(req, res) {
    try {
        const updated_at = '';
        let temProx = true;
        let pagina = 1;
        let usuarios = []
        

        while(temProx){
            const notas = await axios.get(`${process.env.APITOTVS}api/framework/v1/users?order=id&page=${pagina}`, {
                params: { updated_at },
                auth: {
                    username: process.env.USERTOTVS,
                    password: process.env.SENHAPITOTVS
                }
            });

            temProx = notas.data.hasNext;
            pagina++;

            notas.data.items.forEach(element => {
                usuarios.push(element);
                console.log(element)
            });
            
        };

        // Conectar ao banco de dados
        await connectToDatabase();

        // Remover todos os registros do banco
        await sql.query`TRUNCATE TABLE SYS_USR`

        // Função para inserir registros em lotes de mil
        const batchSize = 1000;
        for (let i = 0; i < usuarios.length; i += batchSize) {
            const batch = usuarios.slice(i, i + batchSize);

            const promises = batch.map(async element => {
                const { id, userName, active } = element;
                await sql.query`INSERT INTO SYS_USR (ID, userName, active) 
                VALUES (${id}, ${userName}, ${active})`;

                element.groups.forEach(async grp => {
                    const {value, display} = grp;
                    await sql.query`INSERT INTO SYS_USR_GRP (USUARIO_ID, VALUE, DISPLAY) 
                    VALUES (${element.id}, ${value}, ${display})`;
                });
            });

            // Esperar a conclusão das inserções do lote atual antes de continuar
            await Promise.all(promises);
        }

        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SYS_USR', ${getCurrentSQLServerDateTime()}, 200)`
        res.sendStatus(200);
    } catch (error) {
        await connectToDatabase();
        await sql.query`INSERT INTO LOG_TABELAS (TABELA, HORARIO, STATUS) VALUES ('SYS_USR', ${getCurrentSQLServerDateTime()}, ${error.response?.status || 500})`
        console.log(error)
        res.sendStatus(500);
    }
}

module.exports = { 
    atualizarSysUsr
};