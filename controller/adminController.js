const Coupon = require("../model/couponModel")
const User = require("../model/userModel")
const Offer = require("../model/offerModel")
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");

//utils
const CalculateTotal = require("../utils/calculateTotal");
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
    res.render('admin/login', { error: "Invalid username or password" });
  }
};

const loadAdminhome = async (req, res) => {
  try {
    res.render("admin/adminhome");
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


const userList = async (req, res) => {
  try {
    const users = await User.find()

    res.render('admin/userlist', { users });
  } catch (error) {
    console.error('Error fetching user list:', error);
    res.status(500).send('Internal Server Error');
  }
};

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
     console.log(existingOffers,"off");
    res.render('admin/addOffer', { products, category,existingOffers })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }


}
//...................................................................
const offerList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.search || "";
    const limit = 5;
    const skip = (page - 1) * limit;

    const regexPattern = new RegExp(searchTerm, "i");
    const offers = await Offer.find({}).populate('discountedCategory').populate('discountedProduct').skip(skip).limit(limit).sort({ createdAt: -1 });
    console.log(offers, "wr")

    const count = await Offer.countDocuments({ offerName: regexPattern });
    const totalPage = Math.ceil(count / limit);
    res.render("admin/offerList", { offers, currentPage: page, totalPage, searchTerm })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }

}
//..................................................................................
const addOffer = async (req, res) => {
  try {
    const products = await Product.find({})
    const category = await Category.find({});

    const { name, discountOn, discountType, discountValue, expireOn, discountedProduct, discountedCategory } = req.body;
    console.log(req.body)
    let offerData = {}; // Initialize an empty object to hold offer data

    if (discountOn === 'product') {

      offerData = {
        name,
        discountOn,
        discountType,
        discountValue,
        expireOn,
        discountedProduct: new mongoose.Types.ObjectId(discountedProduct)
      };
    } else if (discountOn === 'category') {
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
     console.log(offer,"offfff");
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

        product.offerPrice =discountedPrice
        product.discountStatus = offer.isActive;
      }

      await product.save();
      //.........................................................

    }else if(offer.discountOn=='category'){
      const productsToUpdate=await Product.find({category:offer.discountedCategory})
     
    for(const product of productsToUpdate){
    if(!product){
      console.log("product not found in Category");
    }
    
    if (!offer.isActive) {
      product.offerPrice = null;

    }else{

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
    console.log(offer,"crt");
    res.render("admin/editOffer", { offer,products,category })

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
    const {name, expireOn, discountValue, discountType } = req.body; // Assuming _id is provided to identify the offer
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
  editOffer
};
