function adicionarHorasUteis(dataInicial, horasUteis) {
    const horasPorDia = 24;
    const diaSemana = dataInicial.getDay();
    let horasRestantes = horasUteis;

    while (horasRestantes > 0) {
        const diaDaSemana = dataInicial.getDay();

        if (diaDaSemana >= 1 && diaDaSemana <= 5) { // Segunda a Sexta
            if (horasRestantes >= horasPorDia) {
                dataInicial.setDate(dataInicial.getDate() + 1);
                horasRestantes -= horasPorDia;
            } else {
                dataInicial.setHours(dataInicial.getHours() + horasRestantes);
                horasRestantes = 0;
            }
        } else { // Sábado ou Domingo
            dataInicial.setDate(dataInicial.getDate() + 1);
        }
    }

    // Converte a data final para o formato 'YYYY-MM-DD HH:MM:SS'
    const ano = dataInicial.getFullYear();
    const mes = String(dataInicial.getMonth() + 1).padStart(2, '0');
    const dia = String(dataInicial.getDate()).padStart(2, '0');
    const horas = String(dataInicial.getHours()).padStart(2, '0');
    const minutos = String(dataInicial.getMinutes()).padStart(2, '0');
    const segundos = String(dataInicial.getSeconds()).padStart(2, '0');

    const dataFinal = `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

    return dataFinal;
}

module.exports = {adicionarHorasUteis};
