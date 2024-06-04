const Coupon = require("../model/couponModel")
const User = require("../model/userModel")
const Offer = require("../model/offerModel")
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const order = require("../model/orderModel");
 //utils

// const { Mongoose, Schema } = require("mongoose");
const mongoose = require('mongoose');
const product = require("../model/productModel");




const displayLoginForm = async function (req, res) {
  try {
    res.render("admin/login");
  } catch (err) {
    console.log(err.message);
  }
};

const login = (req, res) => {
  const { username, password } = req.body; //ENTER AYITTUNDO CHECKING
  //CHECKING FOR WHETHER ENTERD

  const adminUsername = "safwan.0491@gmail.com";
  const adminPassword = "12345qwe";

  if (username === adminUsername && password === adminPassword) {
    req.session.admin = adminUsername;
    res.redirect('/admin/home');

  } else {
    res.render('admin/login', { errMessage: " Password Not Matching" });
  }
};

//.............................................................................................................
const loadAdminhome = async (req, res) => {
  try {
    const products = await Product.find();
    const category = await Category.find();
    const orders=await order.find({ status: "Delivered" })
    console.log('orders',orders);
    //......................................................chart.................................
    const orderCountsByMonth = Array.from({ length: 12 }, () => 0);
    orders.forEach(order => {
        if (order.createdAt) { 
            const orderDate = new Date(order.createdAt); 
            if (!isNaN(orderDate)) { 
                const monthIndex = orderDate.getMonth();
                orderCountsByMonth[monthIndex]++;
            }
        }
    });
    console.log(orderCountsByMonth, "obdm");
    
    const productCountsByMonth = Array.from({ length: 12 }, () => 0);
    console.log('products',products)
    products.forEach(product => {
        if (product.createdAt) { // Ensure createdAt exists
          console.log('1')
            const createdAtDate = new Date(product.createdAt); // Ensure it's a Date object
            if (!isNaN(createdAtDate)) { // Check if the Date object is valid

                const monthIndex = createdAtDate.getMonth();
                console.log("mothe I :",monthIndex)
                productCountsByMonth[monthIndex]++;
            } else {

              productCountsByMonth[monthIndex] = 1
            } 
        }
    });
    console.log(productCountsByMonth, "prdbm");

     const orderCountsByYearData=await order.aggregate([
     {
       $group:{
         _id:{$year:'$createdAt'},
         orderCount:{$sum:1}

       }
    
     },

     {
      $sort:{"_id":1}

     }


     ])
     const orderCountsByYear=[];
     let currentYearIndex=0;
     const currentYear=new Date().getFullYear();

     for(let i=0;i<orderCountsByYearData.length;i++){
     const year=orderCountsByYearData[i]._id;
     const orderCount=orderCountsByYearData[i].orderCount

    while(currentYear-5+currentYearIndex<year){
      orderCountsByYear.push(0)
      currentYearIndex++;
    }
    orderCountsByYear.push(orderCount);
    currentYearIndex++;


     }

     while(currentYear-5+currentYearIndex<=currentYear+6){
      orderCountsByYear.push(0)
     currentYearIndex++;
     }

console.log(orderCountsByYear,"orderbyyear");


const productCountsByYearData=await order.aggregate([
  {
    $group:{
      _id:{$year:'$createdAt'},
      productCount:{$sum:1}

    }
 
  },

  {
   $sort:{"_id":1}

  }


  ])
//............................
const productCountsByYear=[];
 let currentYearIndex1=0;
const currentYear1=new Date().getFullYear()


for(let i=0;i<productCountsByYearData.length;i++){
  const year=productCountsByYearData[i]._id;
  const productCount=productCountsByYearData[i].productCount

  while(currentYear1-5+currentYearIndex1<year){
   productCountsByYear.push(0);
   currentYearIndex1++;

  }
 
  productCountsByYear.push(productCount)
   currentYearIndex1++

 }

 while(currentYear1-5+currentYearIndex1<=currentYear1+6){
productCountsByYear.push(0);
 currentYearIndex1++


}
 console.log(productCountsByYear,"prdyear");

const totalAmountByYearData = await order.aggregate([
  {
      $group: {
          _id: { $year: "$createdAt" },
          totalPrice: { $sum: { $toDouble: "$totalPrice" } }
      }
  },
  {
      $sort: { "_id": 1 }
  }
 ]);

console.log(totalAmountByYearData,"tmdta");

const totalAmountByYear=[]
let currentYearIndex2=0;
const currentYear2=new Date().getFullYear();

for(let i=0;i<totalAmountByYearData.length;i++){

  const year=totalAmountByYearData[i]._id;
  const totalPrice=totalAmountByYearData[i].totalPrice

  while (currentYear2-5+currentYearIndex2<year){
  totalAmountByYear.push(0);
  currentYearIndex2++;

  }
 totalAmountByYear.push(totalPrice)
 currentYearIndex2++;

}

while(currentYear2-5+currentYearIndex2<=currentYear2+6 ){
   totalAmountByYear.push(0);
   currentYearIndex2++;
}
console.log(totalAmountByYear,"tmuyear");


const totalAmountByMonth = Array.from({ length: 12 }, () => 0);

orders.forEach(order => {
    if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        if (!isNaN(orderDate)) {
            const monthIndex = orderDate.getMonth();
            const totalAmount = parseFloat(order.totalPrice);
            totalAmountByMonth[monthIndex] += totalAmount;
        }
    }
});


for (let i = 0; i < 12; i++) {
    if (totalAmountByMonth[i] === 0) {
        totalAmountByMonth[i] = 0; 
    }
}

console.log(totalAmountByMonth,"totlaamount");


//.................................................................................
    const bestSellingProducts = await order.aggregate([
      { $unwind: "$Items" },
      {
        $group: {
          _id: "$Items.Product",
          totalSales: { $sum: "$Items.quantity" } 
        }
      },
      { $sort: { totalSales: -1 } }, 
      { $limit: 10 }, 
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" }, 
      {
        $project: {
          productName: "$product.productName", 
          totalSales: 1 
        }
      }
    ]);

    console.log(bestSellingProducts, "selling"); // Log the best-selling products

    const bestSellingCategories= await order.aggregate([
      {$unwind:"$Items"},
      {
        $group: {
          _id: "$Items.Product",
          totalSales: { $sum: "$Items.quantity" } 
        }
      },
      { $sort: { totalSales: -1 } }, 
      { $limit: 10 }, 
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" }, 
      
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" }, 

      {
        $project: {
          categoryName: "$category.name",
          totalSales: 1,
         
        }
      }



    ])


 console.log(bestSellingCategories,"ctgries");



    res.render("admin/adminhome", { products, category,orders, bestSellingProducts,bestSellingCategories,
      orderCountsByMonth,orderCountsByYear,productCountsByMonth,productCountsByYear,totalAmountByMonth,totalAmountByYear  });







  } catch (err) {
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};

const getLogout = async (req, res) => {

  try {

    req.session.admin = undefined;
    res.redirect("/admin")
    console.log('ghj');
  } catch (error) {
    console.log(err.message);

  }

}

//............................................................................................................
const userList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.search || "";
    const limit = 5;
    const skip = (page - 1) * limit;
    const regexPattern = new RegExp(searchTerm, "i");
    const users = await User.find({ name: regexPattern }).skip((page-1)*limit).limit(limit)
    const count = await User.countDocuments({name:regexPattern});
    const totalPage = Math.ceil(count / limit);
    res.render('admin/userlist', { users ,currentPage:page,totalPage:totalPage,searchTerm});
  } catch (error) {
    console.error('Error fetching user list:', error);
    res.status(500).send('Internal Server Error');
  }
};

//...........................................................................................................
const userBlock = async (req, res) => {

  try {

    const userdata = req.query.uid
    console.log(userdata);
    const data = await User.findByIdAndUpdate(userdata, { $set: { isBlocked: true } })
    console.log("Blocked user", data);
    res.status(200).json({ data: 'success' })
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error blocking user");
  }

};

const userUnblock = async (req, res) => {
  try {

    const userdata = req.query.uid;
    console.log(userdata);
    const data = await User.findByIdAndUpdate(userdata, { $set: { isBlocked: false } })
    console.log("unblock user", data);
    res.status(200).json({ data: 'success' })
  } catch (error) {
    console.log(err.message);
    res.status(500).send("Error unblocking user");
  }





}


const getAddCouponPage = async (req, res) => {
  try {

    res.render('admin/addCoupon')
  } catch (error) {
    console.error(error)
    res.status(500).send("Error getting Coupon")
  }
}

const addCoupon = async (req, res) => {
  try {
    const { couponname, expiredate, offerprice, minimumprice, code } = req.body;
    console.log(couponname, expiredate, offerprice, minimumprice, code, 'tygf');


    const existingCoupon = await Coupon.findOne({ couponName: couponname })
    if (existingCoupon) {
      res.json({ status: "Exist" })


    } else {
      const newCoupon = new Coupon({
        couponName: couponname,
        expireOn: expiredate,
        offerPrice: offerprice,
        minimumPrice: minimumprice,
        couponCode: code

      })
      console.log(newCoupon);
      const couponData = await newCoupon.save()
      res.redirect('/admin/couponlist')

    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }

}



const couponList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.search || "";
    const limit = 5;
    const skip = (page - 1) * limit;

    const regexPattern = new RegExp(searchTerm, "i");
    const coupons = await Coupon.find({}).skip(skip).limit(limit).sort({ _id: -1 });

    const count = await Coupon.countDocuments({ couponName: regexPattern });
    const totalPage = Math.ceil(count / limit);

    res.render('admin/couponList', { coupons, currentPage: page, totalPage, searchTerm });
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal server Error")
  }


}



const blockCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    await Coupon.findByIdAndUpdate(couponId, { isListed: false });
    console.log("coupon is blocked");
    res.redirect("/admin/couponlist")
  } catch (error) {
    console.log("error blocking coupon", error.message);
  }


}

const unblockCoupon = async (req, res) => {

  try {
    const couponId = req.params.couponId;
    await Coupon.findByIdAndUpdate(couponId, { isListed: true });
    console.log("coupon is unblocked");
    res.redirect("/admin/couponlist")

  } catch (error) {

    console.log("error unblocking coupon", error);
  }


}

const geteditCoupon = async (req, res) => {
  try {
    const { id } = req.query
    const coupon = await Coupon.findById(id)
    res.render("admin/editCoupon", { coupon })

  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }



}

const editCoupon = async (req, res) => {
  try {

    const { couponname, couponId, expiredate, offerprice, minimumprice, code } = req.body
    const newCoupon = {
      couponName: couponname,
      expireOn: expiredate,
      offerPrice: offerprice,
      minimumPrice: minimumprice,
      couponCode: code
    }
    updateCoupon = await Coupon.findByIdAndUpdate(couponId, { $set: newCoupon })

    if (!updateCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.redirect('/admin/couponlist')


  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }


}

//...............................................................
const getAddOfferPage = async (req, res) => {
  try {
    const products = await Product.find()
    const category = await Category.find()
    const existingOffers = await Offer.find({});
    console.log(existingOffers, "off");
    res.render('admin/addOffer', { products, category, existingOffers,message:'',message:'' })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }


}
//...................................................................
const offerList = async (req, res) => {
  try {
    const page=parseInt(req.query.page)||1;
    const searchTerm=req.query.search||" ";
    const limit=5;
    const skip=(page-1)*limit;
    const regexPattern=new RegExp(searchTerm,"i")

    const offers = await Offer.find({name:regexPattern}).populate('discountedCategory').populate('discountedProduct').sort({ createdAt: -1 }).skip(skip).limit(limit)
    const count= await Offer.countDocuments({name:regexPattern})
    const totalPage=Math.ceil(count/limit);
    console.log(offers, "wr")
    res.render("admin/offerList", { offers,currentPage:page,totalPage:totalPage,searchTerm })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }

}
//..................................................................................
const addOffer = async (req, res) => {
  try {
    const products = await Product.find({});
    const category = await Category.find({});
    const existingOffers = await Offer.find({});

    const { name, discountOn, discountType, discountValue, expireOn, discountedProduct, discountedCategory } = req.body;
    console.log(req.body)
    let offerData = {}; // Initialize an empty object to hold offer data

    if (discountOn === 'product') {
const productOfferExists=await  Offer.findOne({discountedProduct:discountedProduct})
console.log(productOfferExists)
if(productOfferExists){
 return res.render('admin/addOffer',{products,category,existingOffers,message:"Product Offer Already exists"})

}
      offerData = {
        name,
        discountOn,
        discountType,
        discountValue,
        expireOn,
        discountedProduct: new mongoose.Types.ObjectId(discountedProduct)
      };
    } else if (discountOn === 'category') {
      const categoryOfferExists = await Offer.findOne({discountedCategory:discountedCategory})
      console.log(categoryOfferExists)
      if(categoryOfferExists){
        return res.render('admin/addOffer',{products, category, existingOffers, message: 'Category Offer Already Exists' });
      
      }
      console.log('category', '=====><', discountOn);
      // Discount applied to a category
      offerData = {
        name,
        discountOn,
        discountType,
        discountValue,
        expireOn,
        discountedCategory: new mongoose.Types.ObjectId(discountedCategory)
      };
    } else {
      // Invalid discountOn value
      return res.status(400).send("Invalid discountOn value");
    }
    const discountCategoryObjId = discountedCategory ? new mongoose.Types.ObjectId(discountedCategory) : null
    const discountProductObjId = discountedProduct ? new mongoose.Types.ObjectId(discountedProduct) : null

    console.log("Offer methid :", offerData)
    const existingNameOffer = await Offer.findOne({ name })
    console.log(existingNameOffer, "nameoffer")
    const exisitngCategoryOffer = await Offer.findOne({ discountedCategory: discountCategoryObjId })
    console.log(exisitngCategoryOffer, "catoffer")

    const existingProductOffer = await Offer.findOne({ discountedProduct: discountProductObjId })
    console.log(existingProductOffer, "prooffer")

    console.log('first stage');
    if (existingNameOffer) {
      return res.render("addOffer", {
        products,
        categories: category,
        message: "Duplicate Discount Name not allowed",

      });


    }
    console.log('second stage');

    if (discountedCategory && exisitngCategoryOffer) {
      return res.render("addOffer", {
        products,
        categories: category,
        message: "An offer for this Category Already Exists",

      });

    }
    console.log('third stage');

    if (discountedProduct && existingProductOffer) {
      return res.render("addOffer", {
        products,
        categories: category,
        message: "An offer for this Product  Already Exists",

      });

    }
    console.log('fourth stage');
    
 

    const newOffer = new Offer(offerData);
    await newOffer.save();

    // Update product price if the offer is for a product
    if (discountOn === 'product') {
      const product = await Product.findById(discountedProduct);

      let discountedPrice = product.price; // Initialize discounted price with original product price

      if (discountType === "percentage") {
        // Calculate discount based on percentage
        const discountAmount = Math.floor((product.price * discountValue)) / 100;
        console.log(discountAmount, "amounntnsnf");
        discountedPrice = Math.round(product.price - discountAmount);
      } else if (discountType === "fixedAmount") {
        // Calculate discount based on fixed amount
        discountedPrice = Math.round(product.price - discountValue);
      }

      // Update the product price in the database
      await Product.findByIdAndUpdate(discountedProduct, { offerPrice: discountedPrice });
    } else if (discountOn === 'category') {
      const productsToUpdate = await Product.find({ category: discountedCategory });

      for (const product of productsToUpdate) {
        let discountedPrice = product.price; // Initialize discounted price with original product price

        if (discountType === "percentage") {
          const discountAmount = Math.floor((product.price * discountValue)) / 100;
          discountedPrice = Math.round(product.price - discountAmount);
        } else if (discountType === "fixedAmount") {
          discountedPrice = Math.round(product.price - discountValue);
        }

        await Product.findByIdAndUpdate(product._id, { offerPrice: discountedPrice });
      }
    }

  
    res.redirect("/admin/offerlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
//..................................................................................
const offerBlock = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId);
    console.log(offerId, 'tiou');
    console.log(offer, "offfff");
    if (!offer) {
      return res.status(404).send("Offer not found");
    }

    offer.isActive = !offer.isActive; // Toggle isActive flag

    if (offer.discountOn === 'product') {
      const product = await Product.findById(offer.discountedProduct);

      if (!product) {
        return res.status(404).send("Discounted product not found");
      }

      if (!offer.isActive) {
        // If offer is blocked, revert product's discountValue to its original price
        product.offerPrice = null
      } else {
        // Apply discount based on offer's discountType and discountValue
        let discountedPrice = product.price;

        if (offer.discountType === "percentage") {
          const discountAmount = Math.floor((product.price * offer.discountValue)) / 100;
          discountedPrice = Math.round(product.price - discountAmount);
        } else if (offer.discountType === "fixedAmount") {
          discountedPrice = Math.round(product.price - offer.discountValue);
        }

        product.offerPrice = discountedPrice
        product.discountStatus = offer.isActive;
      }

      await product.save();
      //.........................................................

    } else if (offer.discountOn == 'category') {
      const productsToUpdate = await Product.find({ category: offer.discountedCategory })

      for (const product of productsToUpdate) {
        if (!product) {
          console.log("product not found in Category");
        }

        if (!offer.isActive) {
          product.offerPrice = null;

        } else {

          let discountedPrice = product.price;
          if (offer.discountType === "percentage") {
            const discountAmount = Math.floor((product.price * offer.discountValue)) / 100;
            discountedPrice = Math.round(product.price - discountAmount);
          } else if (offer.discountType === "fixedAmount") {
            discountedPrice = Math.round(product.price - offer.discountValue);
          }

          product.offerPrice = discountedPrice;
          product.discountStatus = offer.isActive;
        }

        await product.save();

      }

    }

    // Save the updated offer
    await offer.save();
    res.redirect("/admin/offerlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//.............................................................................

const geteditOffer = async (req, res) => {
  try {
    const { id } = req.query
    console.log('Offer ID:', id); // Add this line
    const products = await Product.find()
    const category = await Category.find()
    const offer = await Offer.findById(id).populate('discountedCategory').populate('discountedProduct')
    console.log(offer, "crt");
    res.render("admin/editOffer", { offer, products, category })

  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }



}
//.....................................................................
const editOffer = async (req, res) => {
  try {
    const products = await Product.find({});
    const categories = await Category.find({});
    const { name, expireOn, discountValue, discountType } = req.body; // Assuming _id is provided to identify the offer
    const offer = await Offer.findById(req.params.offerId);
    console.log(offer);
    if (!offer) {
      return res.status(404).send("Offer not found");
    }

    // Update offer details
    offer.name = name;
    offer.expireOn = expireOn;
    offer.discountValue = discountValue;
    offer.discountType = discountType;
    await offer.save();

    // Update product prices based on the updated offer
    for (const product of products) {
      let discountedPrice = product.price;

      if (discountType === "percentage") {
        const discountAmount = Math.floor((product.price * discountValue)) / 100;
        discountedPrice = Math.round(product.price - discountAmount);
      } else if (discountType === "fixedAmount") {
        discountedPrice = Math.round(product.price - discountValue);
      }

      product.offerPrice = discountedPrice;
      product.discountStatus = offer.isActive; // Assuming isActive is a property of the offer
      await product.save(); // Save the updated product

    }

    res.redirect("/admin/offerlist");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


//...................................................................................................................


const getSalesReport = async (req, res) => {
  try {
    const startDate = new Date()
    const endDate = new Date()
    startDate.setDate(startDate.getDate() -7);

    const orderCount = await order.countDocuments({ status: "Delivered" })

    const currentPage = parseInt(req.query.page) || 1
    const limit = 5;
    const skip = (currentPage - 1) * limit


    const totalCount = await order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate }, status: "Delivered" })

    const salesOrders = await order.find({ createdAt: { $gte: startDate, $lte: endDate }, status: 'Delivered' }).sort({ createdAt: -1 })
      .populate('userId').populate('couponDetails.couponId').skip(skip).limit(limit);
    console.log('sales',salesOrders);

    const Orders = await order.find({ status: "Delivered" })

    let overallDiscount = 0;
    let totalAmount = 0
    let netDiscount=0;
    let grandTotal = 0

    for (const order of Orders) {
      if (order.couponDetails.offerPrice) {
        overallDiscount += order.couponDetails.offerPrice

      }
      for (const item of order.Items) {
        totalAmount += item.price
      }

    }
    for(i=0;i<Orders.length;i++){
grandTotal+=Orders[i].totalPrice
    }

    netDiscount = grandTotal - overallDiscount;
    console.log(netDiscount);
    const totalPage = Math.ceil(totalCount / limit);
    console.log("sales Report getting here");

    res.render("admin/salesReport", {
      salesOrders: salesOrders,
      totalPage: totalPage,
      currentPage: currentPage,
      orderCount: orderCount,
      overallDiscount: overallDiscount,
      totalAmount: totalAmount,
      netDiscount: netDiscount,
      grandTotal
    })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }

}
//.............................................................................................................

const getCustomSalesReport = async (req, res) => {
  try {
    const startDateString = req.query.startDate || ''
    const endDateString = req.query.endDate || ''
      console.log(startDateString,"string 1");
      console.log(endDateString,"strings 2");
    const startDate = new Date(startDateString)
    startDate.setUTCHours(23,59,59)
    const endDate = new Date(endDateString)
    endDate.setUTCHours(23,59,59)
    endDate.setDate(endDate.getUTCDate()+1)
    console.log(startDate,"start"); 
    console.log(endDate,"end"); 



    const currentPage = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (currentPage - 1) * limit

    const orderCount=await order.countDocuments({status:'Delivered'})

    const totalCount = await order.countDocuments({
      createdAt : {$gte : startDate, $lte : endDate},
      status : 'Delivered'
  });
  
   console.log(totalCount,"count");
    
  const salesOrders = await order.find({ createdAt: { $gte: startDate, $lte: endDate }, status: 'Delivered' }).sort({ createdAt:-1 })
  .populate('userId').populate('couponDetails.couponId').skip(skip).limit(limit);
console.log('sales',salesOrders);

    const Orders=await order.find({status:'Delivered'})

    
   let overallDiscount = 0;
   let totalAmount = 0;
   let netDiscount=0;


   for (const order of Orders) {
    if (order.couponDetails.offerPrice) {
      overallDiscount += order.couponDetails.offerPrice

    }
    for (const item of order.Items) {
      totalAmount += item.price
    }

  }

  netDiscount = totalAmount - overallDiscount;
  const totalPage=Math.ceil(totalCount/limit)
  console.log("salesReport ready  for filter");

function formatDateToUTC(date) {
  const year = date.getUTCFullYear();
  const month = padZero(date.getUTCMonth() + 1);
  const day = padZero(date.getUTCDate());


  return `${year}-${month}-${day}`;
}

function padZero(num) {
  return num.toString().padStart(2, '0');
}




  res.render("admin/salesReport", {
    salesOrders: salesOrders,
    startDate:formatDateToUTC(startDate),
    endDate:formatDateToUTC(endDate),
    totalPage: totalPage,
    currentPage: currentPage,
    orderCount: orderCount,
    overallDiscount: overallDiscount,
    totalAmount: totalAmount,
    netDiscount: netDiscount,
  
  })

  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error");
  }
}



//................................................................

module.exports = {
  displayLoginForm,
  login,
  loadAdminhome,
  userList,
  userBlock,
  userUnblock,
  getLogout,
  getAddCouponPage,
  couponList,
  addCoupon,
  unblockCoupon,
  blockCoupon,
  geteditCoupon,
  editCoupon,
  getAddOfferPage,
  offerList,
  addOffer,
  offerBlock,
  geteditOffer,
  editOffer,
  getSalesReport,
  getCustomSalesReport,

};
