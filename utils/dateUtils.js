const moment = require('moment');

function formatDateToMySQL(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDate(date) {
    return moment(date).format('DD/MM/YYYY HH:mm');
}

function formatCurrentDateTimeForMySQL() {
    const date = new Date();
  
    // Extrai os componentes da data e hora
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses são base 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    // Formata a data e hora no padrão desejado
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split('/');
    return `${day}/${month}/${year}`;
}
  

module.exports = { formatDateToMySQL, formatDate, formatCurrentDateTimeForMySQL, convertDateFormat};
