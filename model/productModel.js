const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({


    productName: {
        type: String,
        required: true,

    },

    description: {

        type: String,
        required: true,

    },

    brand: {

        type: String,
        required: true,

    },

    category: {


        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "category"

    },

    Stock: {
        type: Number,
        required: true
    },

    productImage: [{

        type: String,
        required: true,

    }],




    price: {
        type: Number,
        required: true,


    },

  offerPrice:{
    type:Number,
    

  },




    isBlocked: {
        type: Boolean,
        default: false,
    },


});


const product = mongoose.model('product', productSchema)


module.exports = product;