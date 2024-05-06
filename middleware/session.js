const is_userlogin=async(req,res,next)=>{
    try {
        if(req.session.user){
            console.log('hi enterd in userAuth');
            next()
        }
        else{
            res.redirect('/login')
        }
    } catch (error) {
        console.error(error)
    }
}

const is_userlogout=async(req,res,next)=>{
    try {
        if(req.session.user){
            res.redirect('/')
        }
        else{
            next()
            
        }
        
    } catch (error) {
        console.error(error)
    }
}


const isauth = async (req, res, next) => {
    try {
      if (req.session.user) {
        next();
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };







module.exports= {is_userlogin,is_userlogout,isauth}