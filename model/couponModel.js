const mongoose=require('mongoose')

const couponSchema=mongoose.Schema({
couponName:{
 type:String,
 required:true,
},

createdAt:{
type:Date,
default:Date.now(),
  
},

expireOn:{
type:String,
required:true,

},
offerPrice:{
type:Number,
required:true

},

minimumPrice:{
type:Number,
required:true

},

couponCode:{
type:String

},

isListed:{
type:Boolean,
default:true
},

userId : {
    type : Array
}

})

const Coupon=mongoose.model('Coupon',couponSchema)


module.exports=Coupon;