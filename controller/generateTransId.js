const generateTransactionID=(length=10)=>{
    const characters='ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    let result='TXN';


    for(let i=0;i<length;i++){
      const randomIndex=Math.floor(Math.random()*characters.length);
      result+=characters.charAt(randomIndex);
    }

    console.log(result);
    return result;



}
module.exports=generateTransactionID;