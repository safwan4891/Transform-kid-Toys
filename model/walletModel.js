const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletAmount: {
    type: Number,
    default: 0,

  },

  Transaction: [{

    TransactionId:{
     type:String,
    },

    
    Amount: {
      type: Number,

    },
    createdAt: {
      type: Date,
      default: Date.now()

    },

    status: {
      type: String,

    },

    remarks: {
      type: String,

    },

  }],


})

const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = Wallet