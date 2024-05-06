const orderModel = require("../model/orderModel");
const Product = require("../model/productModel");
const Address = require('../model/addressModel');
const User = require("../model/userModel");
const cart = require('../model/cartModel');
const order = require("../model/orderModel");
const product = require("../model/productModel");
const orderId = require('../controller/generateOrderid')
const Wallet=require('../model/walletModel')
const Coupon = require("../model/couponModel")
const RazorPay=require('Razorpay');
const crypto=require('crypto');
const { default: mongoose } = require("mongoose");

var instance=new RazorPay({
key_id:process.env.RAZORPAY_KEY_ID,
key_secret:process.env.RAZORPAY_KEY_SECRET
});




//..............................................................................
const getCheckoutPage = async (req, res) => {

    try {

        const userid = req.session.user;
        const currAddress = await Address.find({ userId: userid })
        const userCart = await cart.findOne({ userId: userid }).populate('items.product')
        const coupons = await Coupon.find({ isListed: true })
        console.log(coupons,"couponn");
        res.render("user/checkOut", { userCart, currAddress,coupons })

    } catch (error) {

        console.log(error.message)

    }

}

//..........................................................................
const orderPlaced = async (req, res) => {
    try {
      const { addressId,total,couponCode } = req.body;
        console.log(couponCode,'riuo');
  
      const address = await Address.findById(addressId);

  
      const userId = req.session.user;
      const userCart = await cart.findOne({ userId }).populate('items.product');
      
      const items = userCart.items;  
    
      let totalPrice = 0;

      const hasBlockedProduct = items.some(item => item.product.isBlocked);

      if (hasBlockedProduct) {
          return res.status(400).json({ error: 'One or more products in your cart are blocked and cannot be ordered.' });
      }

      userCart.items.forEach(item => {
        totalPrice += item.price * item.quantity;
      });
  

 const products=items.map(item=>({
  Product:item.product._id,
  quantity:item.quantity,
  status:"Confirmed",
  price:item.offerPrice?item.offerPrice:item.price
 
}))
      


const orderID = orderId()
let response
     if(req.body['paymentMethod']=='COD'){
      console.log("this is order iddd====>>>",orderID );
       response =  await orderModel.create({
        Items:products,
          totalPrice:total,
          address: addressId,
          payment: "cod",
          userId,
          status: 'Confirmed',
          orderid:orderID
      
          
      });


      if (couponCode && response) {
        const coupons = await Coupon.findOne({ couponCode: couponCode });
        console.log(coupons, "tyyyyy");
        if (coupons) {
            coupons.userId.push(userId);
            await coupons.save();
            await orderModel.findByIdAndUpdate(response._id, { coupons: couponCode });
        } else {
            console.log("Coupon not found");
            // Handle case where coupon code is invalid
        }
    }

      userCart.items.forEach(async (item) => {
        const product = await Product.findById(item.product._id);
        product.Stock -= item.quantity;
        await product.save();
      });

      // Empty the cart after placing the order
           userCart.items=[];
         await userCart.save();


     res.json({payment:"cod"})
     }else if(req.body['paymentMethod']=='razorpay'){
      console.log("this is order iddd====>>>",orderID );
       response =  await orderModel.create({
        Items:products,
          totalPrice:total,
          address: addressId,
          payment: "razorpay",
          userId,
          status: 'Confirmed',
          orderid:orderID
       
      });
      
      if (couponCode && response) {
        const coupons = await Coupon.findOne({ couponCode: couponCode });
        console.log(coupons, "tyyyyy");
        if (coupons) {
            coupons.userId.push(userId);
            await coupons.save();
            await orderModel.findByIdAndUpdate(response._id, { coupons: couponCode });
        } else {
            console.log("Coupon not found");
            // Handle case where coupon code is invalid
        }
    }

      userCart.items.forEach(async (item) => {
        const product = await Product.findById(item.product._id);
        product.Stock -= item.quantity;
        await product.save();
      });

      userCart.items=[];
      await userCart.save();
      

    const data = await generateRazorPay(orderID,total)
     console.log(data,'=======')
     res.json({payment :'razorpay',data})

     }
     
    } catch (error) {
      console.error(error);
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
};


//........

const verifyPayment = async (req, res) => {
  try {
    console.log(req.body)
      let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      console.log(req.body.payment.razorpay_order_id,req.body.payment.razorpay_payment_id,"==========>=====>")
      hmac.update(`${req.body.payment.razorpay_order_id}|${req.body.payment.razorpay_payment_id}`);
      hmac = hmac.digest("hex");
      if (hmac === req.body.payment.razorpay_signature) {
          console.log("true");
          res.json({ status: true});
      } else {
          console.log('false');
          res.json({ status: false });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


 const  generateRazorPay=(orderID,total)=>{
    return new Promise((resolve,reject)=>{
     var options={
     amount:total*100,
     currency:'INR',
     receipt:orderID+''
     };
     instance.orders.create(options,function(err,order){
      if(err){
     console.log(err)
      }else{
      console.log(order,"RAZOR" )
      resolve(order)
      }
     })


    })
   }


const paymentConfirm=async(req,res)=>{
try {
  console.log(req.body,"reqbodshjcbsjhb");
const orderID = req.body.orderId
  const data = await order.findOneAndUpdate({orderid:orderID},{$set:{status:'Confirmed'}})
  console.log(data)

} catch (error) {
  console.error(error)
}


}

//...............................................................................


const orderSucess=(req,res)=>{
    res.render('user/orderPlaced')

    try {
      
    } catch (error) {
      console.log(error);
    }
}

//...............................................................

const getOrderListPage=async(req,res)=>{
     
try {
  const page = parseInt(req.query.page) || 1;
  const searchTerm=req.query.search||" ";
  const limit=5;
  const skip=(page-1)*limit;
  
  
  const regexPattern=new RegExp(searchTerm,"i")
  const orders=await order.find({}).skip(skip).limit(limit).populate("userId").sort({createdAt:-1}) 
console.log("orders",orders);

const count=await order.countDocuments({})
const totalPage=Math.ceil(count/limit)
console.log("orders");

  res.render('admin/orderList',{order:orders,currentPage:page,totalPage:totalPage,searchTerm: searchTerm})        
} catch (error) {
  console.error(error)
}

}

const getOrderDetailPage=async(req,res)=>{
try {

  const orderId=req.query.id
  console.log("orderId",orderId);
const orders= await order.findOne({_id:orderId}).populate("userId").populate("address").populate("Items.Product")
console.log("orders",orders);
  res.render('admin/orderDetail',{order:orders})
  
} catch (error) {
  console.log(error)  
}

}
//.............................................................................

const adminOrderDelivered = async (req, res) => {
  try {
    const {orderId} = req.body;
    console.log(orderId, "iui");

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const orderedProduct = await order.findById(orderId);
    if (!orderedProduct) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (orderedProduct.status === "Delivered") {
      return res.status(400).json({ error: "Order is already delivered" });
    }
    orderedProduct.status = "Delivered";
    await orderedProduct.save();

    res.status(200).json({ message: "Order marked as delivered successfully", order: orderedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



//.................................................................................

const adminOrderCancel=async(req,res)=>{
  try {
    const { orderId, productId } = req.body;
     const user=req.session.user
    console.log(req.body, "wrg");

    if (!orderId) {
      return res.status(400).json({ error: "Order not found" });
    }

    const cancelProduct = await Product.findById(productId);
    console.log(cancelProduct, "cnn");
    if (!cancelProduct) {
      return res.status(404).json({ error: "Product not found in order" });
    }

    const orderedProduct = await order.findById(orderId);

    const productIndex = orderedProduct.Items.findIndex(item => item.Product.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in order" });
    }


    // Update the product status to 'Cancelled' and save
    orderedProduct.Items[productIndex].status = "Cancelled";

   //updating totalPrice after cancelling one product
     orderedProduct.totalPrice-=orderedProduct.Items[productIndex].price*orderedProduct.Items[productIndex].quantity;  
     //refiling wallet amount after canceling
      walletamount=orderedProduct.Items[productIndex].price*orderedProduct.Items[productIndex].quantity;

    if(orderedProduct.payment==="razorpay"&&orderedProduct.status==="Confirmed"){
      //addind amount to wallet after canceling
    const findUser=await User.findById(orderedProduct.userId)
   if(findUser){
    console.log(findUser.WalletBalance ,"jhjhhjjhhdhcvus,")
    const newWalletbalance = findUser.WalletBalance+ walletamount

    console.log(findUser,"gggg");
    findUser.WalletBalance = newWalletbalance
    await findUser.save()    
    const wallet = await Wallet.findOne({userId:findUser._id});
    if(wallet){

      await Wallet.findOneAndUpdate({userId:findUser._id},{$push:{Transaction:{Amount:walletamount,createdAt:Date.now(),status:'credit',remarks:'Order Cancelled'}}})
    }
    
    await wallet.save();

   }else{
    return res.status(400).json({error:"User Not Found"})
   }

  


    }


    if (orderedProduct.Items.every(item => item.status === "Cancelled")) {
      orderedProduct.status = "Cancelled";
    }
    await orderedProduct.save();

    // Adjust the product stock
    const product = await Product.findById(productId);
    product.Stock += orderedProduct.Items[productIndex].quantity;
    await product.save();


    res.status(200).json({ message: "Product Cancelled successfully",product: orderedProduct.Items[productIndex],});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
//.........................................................................
const orderDetailPageUser=async(req,res)=>{
try {
  const orderId=req.query.id;
  const orders=await order.findOne({_id:orderId}).populate("userId").populate("address").populate("Items.Product")
  res.render('user/orderDetail',{order:orders})
} catch (error) {
  console.log(error)
}

}

//.......................................................................................

const userOrderCancel = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
     const user=req.session.user
    console.log(req.body, "wrg");

    if (!orderId) {
      return res.status(400).json({ error: "Order not found" });
    }

    const cancelProduct = await Product.findById(productId);
    console.log(cancelProduct, "cnn");
    if (!cancelProduct) {
      return res.status(404).json({ error: "Product not found in order" });
    }

    const orderedProduct = await order.findById(orderId);

    const productIndex = orderedProduct.Items.findIndex(item => item.Product.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in order" });
    }


    // Update the product status to 'Cancelled' and save
    orderedProduct.Items[productIndex].status = "Cancelled";

   //updating totalPrice after cancelling one product
     orderedProduct.totalPrice-=orderedProduct.Items[productIndex].price*orderedProduct.Items[productIndex].quantity;  
     //refiling wallet amount after canceling
      walletamount=orderedProduct.Items[productIndex].price*orderedProduct.Items[productIndex].quantity;

    if(orderedProduct.payment==="razorpay"&&orderedProduct.status==="Confirmed"){
      //addind amount to wallet after canceling
    const findUser=await User.findById(orderedProduct.userId)
   if(findUser){
    console.log(findUser.WalletBalance ,"jhjhhjjhhdhcvus,")
    const newWalletbalance = findUser.WalletBalance+ walletamount

    console.log(findUser,"gggg");
    findUser.WalletBalance = newWalletbalance
    await findUser.save()    
    const wallet = await Wallet.findOne({userId:findUser._id});
    if(wallet){

      await Wallet.findOneAndUpdate({userId:findUser._id},{$push:{Transaction:{Amount:walletamount,createdAt:Date.now(),status:'credit',remarks:'Order Cancelled'}}})
    }
    
    await wallet.save();

   }else{
    return res.status(400).json({error:"User Not Found"})
   }

  


    }


    if (orderedProduct.Items.every(item => item.status === "Cancelled")) {
      orderedProduct.status = "Cancelled";
    }
    await orderedProduct.save();

    // Adjust the product stock
    const product = await Product.findById(productId);
    product.Stock += orderedProduct.Items[productIndex].quantity;
    await product.save();


    res.status(200).json({ message: "Product Cancelled successfully",product: orderedProduct.Items[productIndex],});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};




//..............................................................................................................

const returnOrder=async(req,res)=>{

  try {
    const { orderId, productId } = req.body;
     const user=req.session.user
    console.log(req.body, "wrg");

    if (!orderId) {
      return res.status(400).json({ error: "Order not found" });
    }

    const returnProduct = await Product.findById(productId);
    console.log(returnProduct, "cnn");
    if (!returnProduct) {
      return res.status(404).json({ error: "Product not found in order" });
    }

    const orderedProduct = await order.findById(orderId);

    const productIndex = orderedProduct.Items.findIndex(item => item.Product.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in order" });
    }


    // Update the product status to 'Returned' and save
    orderedProduct.Items[productIndex].status = "Returned";

   //updating totalPrice after returning one product
     orderedProduct.totalPrice-=orderedProduct.Items[productIndex].price*orderedProduct.Items[productIndex].quantity;  
     //refiling wallet amount after canceling
      walletamount=orderedProduct.Items[productIndex].price*orderedProduct.Items[productIndex].quantity;

    if(orderedProduct.payment==="Cod"&&orderedProduct.status==="Delievered"){
      //addind amount to wallet after canceling
    const findUser=await User.findById(orderedProduct.userId)
   if(findUser){
    console.log(findUser.WalletBalance ,"jhjhhjjhhdhcvus,")
    const newWalletbalance = findUser.WalletBalance+ walletamount

    console.log(findUser,"gggg");
    findUser.WalletBalance = newWalletbalance
    await findUser.save()    
    const wallet = await Wallet.findOne({userId:findUser._id});
    if(wallet){

      await Wallet.findOneAndUpdate({userId:findUser._id},{$push:{Transaction:{Amount:walletamount,createdAt:Date.now(),status:'credit',remarks:'Order Returned'}}})
    }
    
    await wallet.save();

   }else{
    return res.status(400).json({error:"User Not Found"})
   }

  


    }


    if (orderedProduct.Items.every(item => item.status === "Returned")) {
      orderedProduct.status = "Returned";
    }
    await orderedProduct.save();

    // Adjust the product stock
    const product = await Product.findById(productId);
    product.Stock += orderedProduct.Items[productIndex].quantity;
    await product.save();


    res.status(200).json({ message: "Product Returned successfully",product: orderedProduct.Items[productIndex],});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
    getCheckoutPage,
    orderPlaced,
   orderSucess,
   getOrderListPage,
   getOrderDetailPage,
   adminOrderCancel,
   orderDetailPageUser,
   userOrderCancel,
   returnOrder,
   verifyPayment,
   paymentConfirm,
   adminOrderDelivered
  
    

}