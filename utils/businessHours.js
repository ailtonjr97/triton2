// utils.js
function addBusinessHours(date, hours) {
    let newDate = new Date(date);
    let addedHours = 0;
  
    while (addedHours < hours) {
      newDate.setHours(newDate.getHours() + 1);
      
      // Verifica se a nova data não cai em um fim de semana
      if (newDate.getDay() !== 0 && newDate.getDay() !== 6) { // 0 = Domingo, 6 = Sábado
        addedHours++;
      }
    }
  
    return newDate;
  }
  
  module.exports = { addBusinessHours };
  