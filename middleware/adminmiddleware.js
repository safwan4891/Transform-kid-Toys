const islogin=async(req,res,next)=>{

try{

if(req.session.admin){
console.log("working");
    next()
}else{


    res.redirect("/admin")
}
}catch(error){

console.log(error);

}

};

const isLogout = async (req, res, next) => {
    try {
      if (req.session.admin) {
        res.redirect("/admin/home")
      } else {
      next()
      }
    } catch (error) {
      console.log(error);
    }
  };

  


  module.exports={
    islogin,
    isLogout,
   

  }



