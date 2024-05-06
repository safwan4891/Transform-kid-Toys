const mongoose=require('mongoose')

const cartSchema=new mongoose.Schema({
 userId:{
   type:mongoose.Schema.Types.ObjectId,
   ref:'User',
    required:true
},

items:[{
product:{
   type:mongoose.Schema.Types.ObjectId,
   ref:'product',
   required:true
},
price:{
  type:Number,
  required:true
},
quantity:{
 type:Number,
 required:true


},
brand:{

 type:String,
 required:true,
    
},
 
}]


})

module.exports=mongoose.model('Cart',cartSchema)

