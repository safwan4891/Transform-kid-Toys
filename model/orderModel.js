const mongoose=require("mongoose");

const orderSchema=new mongoose.Schema({

Items:[{
Product:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'product',
  required:true,
},

quantity:{
type:Number,
required:true
},

status:{
type:String,
default:'pending',

},

price:{
type:Number,
required:true

},

productStatus:{
  type:Boolean,
  default:false
  },
  
}],

totalPrice:{
 type:Number,
 required:true

},
address:{
type:mongoose.Schema.Types.ObjectId,
ref:'Address',
required:true
},
payment:{
 type:String,
 required:true

},
userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
 },


 couponDetails:{
  couponId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Coupon',
   
  },
  offerPrice:{
    type:Number,
    default:0,
    
    },


 },

 status:{
  type:String,
  required:true
 },

 createdAt:{
  type:Date,
  default:Date.now(),

 },
 orderid:{
  type:String
 }



})




const order=mongoose.model('order',orderSchema)


module.exports=order;