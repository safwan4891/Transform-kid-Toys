const mongoose=require('mongoose')

const wishListSchema  = new mongoose.Schema({


    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
         required:true,
     },
      


items:[{
    product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'product',
    required:true,
    },
   
   }]

})

module.exports=mongoose.model('Wishlist',wishListSchema)