function adicionarHorasUteis(dataInicialStr, horasUteis, horaInicialStr) {
  // Converter a string no formato 'YYYYMMDD' para um objeto Date
  const ano = parseInt(dataInicialStr.substring(0, 4));
  const mes = parseInt(dataInicialStr.substring(4, 6)) - 1; // O mês é base 0 em JavaScript
  const dia = parseInt(dataInicialStr.substring(6, 8));
  
  // Converter a string no formato 'HH:MM:SS' para horas, minutos e segundos
  const [horas, minutos, segundos] = horaInicialStr.split(':').map(num => parseInt(num));
  
  let data = new Date(ano, mes, dia, horas, minutos, segundos); // Data e hora inicial

  let horasRestantes = horasUteis;

  while (horasRestantes > 0) {
      data.setHours(data.getHours() + 1);

      // Verifica se é um dia útil (não é sábado nem domingo)
      if (data.getDay() !== 0 && data.getDay() !== 6) {
          horasRestantes--;
      }
  }

  // Formatar a data no padrão MySQL 'YYYY-MM-DD HH:MM:SS'
  const anoFinal = data.getFullYear();
  const mesFinal = String(data.getMonth() + 1).padStart(2, '0'); // Meses são base 0
  const diaFinal = String(data.getDate()).padStart(2, '0');
  const horasFinal = String(data.getHours()).padStart(2, '0');
  const minutosFinal = String(data.getMinutes()).padStart(2, '0');
  const segundosFinal = String(data.getSeconds()).padStart(2, '0');

  return `${anoFinal}-${mesFinal}-${diaFinal} ${horasFinal}:${minutosFinal}:${segundosFinal}`;
}

module.exports = { adicionarHorasUteis };
