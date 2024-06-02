const mongoose=require('mongoose')
// mongoose.connect("mongodb://localhost:27017/EcommerceToyShop ");
const userSchema=new mongoose.Schema({

name:{
    type:String,
    required:true
},
email:{
  type:String,
  required:true,
  unique:true
},
mobile:{
    type:Number,
    
},
password:{
 type:String,
 requied:true    
},
isAdmin:{
type:Number,

},

WalletBalance:{
  type:Number,
  default:0

},
 referalCode:{
   type:String
 },

 otherreferalCode:{
  type:String
 },

 isBlocked:{
  type:Boolean,
  default:false
},
 

})



const user=mongoose.model('User',userSchema)

module.exports=user

