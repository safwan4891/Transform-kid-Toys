const mongoose=require('mongoose')

const addressSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
     },

 country:{
   type:String,
   required:true  
 },

 Name:{
 type:String,
 required:true
 },
 city:{
  type:String,
  required:true
 },
 landMark: {
    type: String,
    required: true
},
state: {
    type: String,
    required: true
},
pincode: {
    type: Number,
    required: true
},
phone: {
    type: Number,
    required: true
},

HouseName:{
  type:String,
  required:true,

}
})
const Address=mongoose.model("Address",addressSchema)
  module.exports=Address