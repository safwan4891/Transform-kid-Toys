const  generateOrderID = (length = 6) => {
    const digit = '0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digit.length);
      result += digit.charAt(randomIndex);
    }
    console.log(result);
    return result;
 
  }
  

  module.exports = generateOrderID 