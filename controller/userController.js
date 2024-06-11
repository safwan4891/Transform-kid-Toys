const product = require("../model/productModel");
const User = require("../model/userModel");
const nodemailer = require('nodemailer')
const Category = require('../model/categoryModel');
const cart = require('../model/cartModel')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const Address = require('../model/addressModel');
const order = require("../model/orderModel");
const Wishlist = require('../model/wishlistModel')
const Wallet = require('../model/walletModel')
const Coupon = require("../model/couponModel")
const { default: mongoose } = require("mongoose");

const user = require("../model/userModel");
const session = require("express-session");
require('dotenv').config()

//.............................................!....!!!!!!!........................................
const loadregister = async (req, res) => {
  try {
    res.render("user/register",{message:null})

  } catch (error) {
    console.log(error.message)
  }
}



//..................................................................................

const loginload = async function (req, res) {
  try {

    res.render("user/login")
  } catch (error) {
    console.log(error.message)

  }
}

//.................................................................................................

const forgetPass=async(req,res)=>{
  try {
    res.render("user/forgetPassword")
  } catch (error) {
    console.error
  }
};
//..........................................................................................................
const getpasswordReset=async(req,res)=>{
  const token=req.params.token
try {
  res.render('user/passwordReset',{token})
} catch (error) {
  console.error(error)
}
  
}

//............................................................................................................
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    req.session.forgotemail = email;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
      },
    });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email Not Found" });
    }

    // Generate a unique token for password reset
    const token = Math.random().toString(36).substr(2, 8);

    // Update user's resetPasswordToken and resetPasswordExpires in the database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: `You are receiving this because you (or someone else) have requested to reset your password.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `http://${req.headers.host}/getResetPassword/${token}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Error Sending Email" });
      }
      console.log('Email Sent: ' + info.response);
      res.status(200).json({ message: "Reset email sent" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//.........................................................................................................
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  console.log(req.session.forgotemail, "--------------------------------------------------------------------------------------")
  if (password !== confirmPassword) {
      return res.status(400).send({ message: 'Passwords do not match' });
  }

  try {
      // Find the user by email and check the resetPasswordToken
      const user = await User.findOne({ email: req.session.forgotemail });

      if (!user) {
          return res.status(400).send({ message: 'Time limit exeeded resend email' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password and reset resetPasswordToken and resetPasswordExpires
      user.password = hashedPassword;
      
      // Save the user
      await user.save();

      // Destroy the session
      req.session.destroy(err => {
          if (err) {
              console.error('Error destroying session:', err);
              return res.status(500).send({ message: 'Internal server error' });
          }
          console.log("Session destroyed");
          res.redirect('/login')
      });

  } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Server error' });
  }
}


//..............................................................................................................
const loaduserHome = async function (req, res) {
  try {
    const categories = await Category.find({ isListed: true })
    const products = await product.find({ isBlocked: false }).limit(8).populate('category')

    const user = req.session.user

    console.log(products);

    res.render("user/userhome", { categories, products, user });

  } catch (error) {
    console.error("Error Loading user home :", error)
    res.status(500).send('Internal Server Error')
  }

};
const loaduserAccount = async function (req, res) {
  res.render("user/useraccount")
};


const loguser = async (req, res) => {


  try {
    const { email, password } = req.body
    console.log(email, password)

    const loggeduser = await User.findOne({ email: email })



    if (loggeduser) {
      console.log("llllllllll")
      if (loggeduser.isBlocked == true) {
        console.log('[[[[[')
        res.render("user/login", { errmessage: "Login Failed!!" })

      } else {

        const hashedPassword = await bcrypt.compare(password, loggeduser.password)
        if (hashedPassword) {

          req.session.user = loggeduser._id;
          console.log("after login", req.session.user)
          res.redirect("/");
        } else {
          console.log('password not match')
          res.render("user/login", { errmessage: "Password Not Match" });
        }

      }
    } else {
      console.log('user not found')
      res.render("user/login", { errmessage: "User Not Found" });
    }




  } catch (err) {
    console.log(err.message);
  }
};



function generateReferralCode() {
  return uuidv4().substring(0, 8)
}


const insertUser = async (req, res) => {
  try {

  const existingUser=await User.findOne({email:req.body.email})
  if(existingUser){
   return res.render('user/register',{message:"User Already Exists"})

  }

  
    const password = await securePassword(req.body.password)
    const referralCode = generateReferralCode()
    console.log(referralCode, "codes");
    console.log(req.body.otherReferalCode, "referred");
    const userIn = {
      name: req.body.username,
      email: req.body.email,
      password: password,
      referalCode: referralCode,
      otherreferalCode: req.body.otherreferalCode,

    };



    req.session.data = userIn;  
    req.session.isOtp=userIn.email
    res.redirect('/loadotp');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'safwan.0491@gmail.com',
        pass: 'nvqh wmoo ngcd nvwg'
      }
    });


    // *****generating otp*****

    let randomotp = Math.floor(1000 + Math.random() * 9000).toString()

    req.session.serverOTP = randomotp
    req.session.save()
    console.log(process.env.MAIL, process.env.PASS)
    console.log("serverotp", req.session.serverOTP);
    console.log(req.session)



    const mailOptions = {
      from: 'safwan.0491@gmail.com',
      to: req.session.data.email,
      subject: ` Hello ${req.session.data.name}`,
      text: `Your verification OTP is ${randomotp}`

    };

    const mail = await transporter.sendMail(mailOptions)
    if (mail) {
      console.log('mail transffred')
    }
    ;

  }
  catch (err) {
    console.log(err.message, 'error')
  }
}


const loadotp = async (req, res, next) => {
  try {
    req.session.isOtp=null
    res.render("user/otp")

  } catch (error) {
    console.log(error.message)
  }

}



const getOtp = async (req, res) => {
  console.log('mailer process', process.env.MAIL)

  try {
    console.log('lllllllllll');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'safwan.0491@gmail.com',
        pass: 'nvqh wmoo ngcd nvwg'
      }
    });


    // *****generating otp*****

    let randomotp = Math.floor(1000 + Math.random() * 9000).toString()

    req.session.serverOTP = randomotp
    req.session.save()
    console.log(process.env.MAIL, process.env.PASS)
    console.log("serverotp", req.session.serverOTP);
    console.log(req.session)



    const mailOptions = {
      from: 'safwan.0491@gmail.com',
      to: req.session.data.email,
      subject: ` Hello ${req.session.data.name}`,
      text: `Your verification OTP is ${randomotp}`

    };

    const mail = await transporter.sendMail(mailOptions)
    if (mail) {
      console.log('mail transffred')
    };
    

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
};

const verifyOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    console.log("otp from body", otp);
    console.log("session", req.session.serverOTP);
    if (otp == req.session.serverOTP) {
      console.log(req.session.data, 'data')
      const user = req.session.data
      const saveUserData = {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        password: user.password,
        referalCode: user.referalCode,
        otherreferalCode: user.otherreferalCode
      }

      const createduser = await User.create(saveUserData)




      if (createduser) {
        const walletData = {
          userId: createduser._id,
          walletAmount: 0,
          Transaction: [

          ],
        }
        const wallet = await Wallet.create(walletData)
        console.log(wallet)
      }



      if (createduser.otherreferalCode) {
        const existingUser = await User.findOne({ referalCode: createduser.otherreferalCode });
        if (existingUser) {

          existingUser.WalletBalance += 200;
          await existingUser.save()

          const wallet = await Wallet.findOne({ userId: createduser._id });
          if (wallet) {
            await User.findByIdAndUpdate({_id:createduser._id},{$inc:{WalletBalance:50}})
            wallet.walletAmount+=50;
            await Wallet.findOneAndUpdate({ userId: createduser._id }, { $push: { 
              Transaction: { Amount: '50', createdAt: Date.now(), status: 'credit', remarks: 'Amount Credited on Registration' } 
            } })
            
           
          }
          
          await wallet.save()
        }
      }



      const providedOtp = req.body.otp
      const generatedOtp = req.session.otp



      res.redirect('/login')
    } else {

      console.log("otp not matching");
      res.render("user/otp", { message: "Otp not matching" })
    }

  } catch (error) {
    console.log(error.message);
    console.error("Error verifying OTP:", error);
    res.status(500).send("Internal Server Error");
  }
}

const resendOtp = async (req, res) => {

  try {
    const { email } = req.session.data
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("newOtp:", newOtp)
    req.session.serverOTP = newOtp;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'safwan.0491@gmail.com',
        pass: 'nvqh wmoo ngcd nvwg'
      }
    });


    const mailOptions = {
      from: 'safwan.0491@gmail.com',
      to: req.session.data.email,
      subject: 'Hello' + req.session.data.name,
      text: `Your verification OTP is ${newOtp}`

    };

    const mail = await transporter.sendMail(mailOptions)
    if (mail) {
      console.log('mail transffred')
    }
    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.log("Error resending OTP:", error);
    res.status(500).json({ error: "Internal server error" })
  }


}


const logoutuser = (req, res) => {
  if (req.session.user || req.session.admin)   //user login checking 
  {
    req.session.destroy((err) => {
      if (err) {
        console.log("error in logging out");
      } else {
        res.redirect("/");
      }
    });
  }
  else {
    res.redirect("/")
  }
};




//const hash password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const cartPage = async (req, res) => {
  try {

    const { user } = req.session;
    console.log(user)
    const userCart = await cart.findOne({ userId: user }).populate('items.product')
    console.log(userCart)
    const findWishlist = await Wishlist.findOne({ userId: user }).populate('items.product')

    res.render('user/cart', { page: userCart, userCart, findWishlist});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


const addCart = async (req, res) => {
  console.log("WORKING");
  try {
    console.log(req.body, "body")
    const productId = req.body.productId;
    console.log(productId);
    const userId = req.session.user;
    console.log("req.session.user", req.session.user)
    console.log(userId, 'userId');
    const Product = await product.findById(productId);
    console.log(Product, "prompt");
    if (!productId) {
      return res.status(400).json({ message: "product not found" });
    }

    //searching a cart for user
    let userCart = await cart.findOne({ userId: userId })
    console.log(userCart);
    if (!userCart) {

      userCart = new cart({ userId, items: [] })
    }
    console.log(userCart.quantity, "userquantity");
    if (req.body.quantity > Product.Stock) {
      res.status(200).json({ success: false, message: "Product is out of stock" });
    }
    else {
      // Check if the product already exists in the cart
      const existingItemIndex = userCart.items.findIndex(item => item.product.toString() === productId);

      if (existingItemIndex != -1) {
        //updating quantity
        userCart.items[existingItemIndex].quantity += parseInt(req.body.quantity) //integer convert akkanam allel add avum stringinoppaM
        console.log(userCart.items[existingItemIndex].quantity, "cartquantity");
        if (userCart.items[existingItemIndex].quantity > Product.Stock) {
          return res.status(200).json({ success: false, message: "Product Stock Limit Exceeds" });
        }
      } else {

        //if the product does'nt exist,add it to cart
        const newItem = {

          product: productId,
          price: Product.offerPrice ? Product.offerPrice : Product.price,
          quantity: req.body.quantity,
          brand: Product.brand,
          productImage: Product.productImage

        };
        console.log(newItem)
        userCart.items.push(newItem);
      }


      // Save the updated cart
      await userCart.save();
      res.status(200).json({ success: true, message: "Product added to cart successfully" });

    }


  } catch (error) {

    console.error("product already exists in the cart");

  }
}
//..................................................................................................................
const increaseQuantity = async (req, res) => {
  try {
    const userData = req.session.user;
    const productId = req.query.pin;
    const indexOfItems = req.query.index;
    console.log(userData, productId, "datassss")
    const productStockAvailable = await cart.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userData) } }, { $unwind: '$items' }, { $match: { 'items.product': new mongoose.Types.ObjectId(productId) } }, { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productdetail' } }])
    console.log('avaialble', productStockAvailable)

    if (productStockAvailable[0].productdetail[0].Stock > productStockAvailable[0].items.quantity) {
      console.log("entered condition")
      const carts = await cart.findOneAndUpdate({ userId: userData, 'items.product': productId }, { $inc: { 'items.$.quantity': 1 } });
      res.status(200).json({ success: "success" })
    } else {
      res.status(403).json({ data: "no stocks available" })
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//.....................................................................

const decreaseQuantity = async (req, res) => {
  try {
    const userData = req.session.user;
    const productId = req.query.pid;
    const indexOfItems = req.query.index
    console.log(userData)
    console.log(productId, "proId")

    const cartData = await cart.findOne({ userId: userData, 'items.product': productId })
    // Ensure quantity doesn't go below 1
    if (cartData.items[indexOfItems].quantity <= 1) {
      console.log("Decrease Quantity")
      return res.status(403).json({ error: "Cannot reduce the size" });
    }

    const carts = await cart.findOneAndUpdate({ userId: userData, 'items.product': productId }, { $inc: { 'items.$.quantity': -1 } });
    const products = await product.findOne({ _id: carts.items[indexOfItems]._id });

    if (indexOfItems < 0 || indexOfItems >= carts.items.length) {
      return res.status(400).json({ message: "Invalid item index" });
    }



    // Ensure quantity doesn't go below 1
    if (carts.items[indexOfItems].quantity <= 1) {
      await cart.findOneAndUpdate(
        { userId: userData },
        { $pull: { items: { product: productId } } }
      );
      return res.status(200).json({ message: "Item removed from cart" });
    }
    carts.items[indexOfItems].quantity--;
    let totalPrice = 0;
    for (const items of carts.items) {
      if (product.offerPrice) {
        totalPrice += product.offerPrice * items.quantity;
      } else {
        totalPrice += product.price * items.quantity;
      }
    }
    carts.totalPrice = totalPrice;



    res.status(200).json({ message: "Quantity updated successfully", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//..............................................................................

const productRemoveFromCart = async (req, res) => {
  try {
    const userData = req.session.user;
    const productId = req.query.productId;
    console.log(userData)
    console.log(productId)

    // Find the user's cart and remove the product
    const carts = await cart.findOneAndUpdate(
      { userId: userData },
      { $pull: { items: { product: productId } } },
      { new: true }
    );

    if (!carts) {
      return res.status(404).json({ message: "Cart not found" });
    }


    res.redirect("/getcart")




  } catch (error) {
    console.error(error);
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userProfile = async (req, res) => {
  try {
    const userid = req.session.user//checking user entered or not
    console.log(userid);
    console.log("working")
    const userdata = await User.findOne({ _id: userid })
    const addressData = await Address.find({ userId: userid })
    console.log("addressdata", addressData);
    const walletData = await Wallet.find({ userId: userid})
    
    walletData.forEach(wallet=>{
   wallet.Transaction.sort((a,b)=>new Date(b.createdAt)-(a.createdAt))

    })
    console.log(walletData,"wallet");
    let name = userdata.name
    console.log('name evde', name);
    let mobile = userdata.mobile
    const orders = await order.find({userId:userid}).sort({ createdAt: -1 })
    res.render('user/userProfile', { name, mobile, orders, userAddress: addressData, wallet: userdata.WalletBalance, walletData }) //ividNNU name,email pass cheyyum frontendikku variable name,email

  } catch (error) {
    console.error(error)

  }

};

const getAddress = async (req, res) => {
  try {
    const userid = req.session.user
    console.log("working");
    const userdata = await User.find({ _id: userid })
    res.render('user/addAddress',)

  } catch (error) {
    console.error(error)


  }

};


const addAddress = async (req, res) => {
  console.log("it is working");
  try {

    const userid = req.session.user
    console.log("user", User);

    const {
      country,
      Name,
      city,
      landMark,
      state,
      pincode,
      phone,
      HouseName

    } = req.body;
    console.log("AddressDetails", req.body);



    // Create a new address document
    const newAddress = new Address({
      userId: userid,
      country: country,
      Name: Name,
      city: city,
      landMark: landMark,
      state: state,
      pincode: pincode,
      phone: phone,
      HouseName: HouseName
    });
    console.log(newAddress, "newadreesss")

    await newAddress.save();


    // Redirect the user to the user profile page
    res.redirect("/userprofile");
  } catch (error) {
    // Handle errors properly, e.g., log them or send an error response
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
const geteditAddress = async (req, res) => {
  try {
    const addressId = req.query.id
    const userid = req.session.user
    console.log("working");
    const currAddress = await Address.findById({
      _id: addressId,
    })
    res.render('user/editAddress', { address: currAddress })

  } catch (error) {
    console.error(error)

  }

};
const editAddress = async (req, res) => {
  try {
    const addressId = req.body.id;
    const { Name, city, landMark, state, pincode, phone, country, HouseName } = req.body;
    console.log(req.body)
    const currAddress = await Address.findByIdAndUpdate({ _id: addressId }, { $set: { country: country, Name: Name, city: city, landMark: landMark, state: state, pincode: pincode, phone: phone, HouseName: HouseName } });

    console.log('Update result:', currAddress);
    res.redirect("/userprofile")
  } catch (error) {
    console.error(error)

  }

}




const getDeleteAddress = async (req, res) => {
  console.log("scene mwone");
  try {
    const addressId = req.query.id;
    const userid = req.session.user
    console.log(addressId);
    const currAddress = await Address.findById({ _id: addressId })

    if (!currAddress) {
      console.log("Address not found");
      return res.status(404).send("Address not found")
    }

    await Address.deleteOne({ userId: userid }, { _id: addressId });//here i didnt stored the  address using array so i used deleteOne
    res.redirect('/userProfile');
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal server Error");
  }


}
//..........................................................................

const getEditProfile = async (req, res) => {
  try {
    const userid = req.session.user
    console.log(userid, "JDM Cars");
    const userdata = await User.findOne({ _id: userid })
    const { name, mobile } = userdata
    console.log(name, mobile)
    res.render('user/editProfile', { name, mobile })
  } catch (error) {
    console.error(error)

  }

}

const editProfile = async (req, res) => {
  try {
    const userid = req.session.user
    console.log(userid, "Take Risk");

    const { name, mobile } = req.body
    console.log(name, mobile)
    const currentUser = await User.findByIdAndUpdate({ _id: userid }, { $set: { name: name, mobile: mobile } })
    console.log(currentUser, "Hard Life");
    res.redirect('/userProfile')
  } catch (error) {
    console.error(error)
  }

}


const changePasswordPage = async (req, res) => {
  try {
    const userid = req.session.user;
    console.log(userid, "works");
    const oldPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    const userdetails = await User.findOne({ _id: userid });

    if (userdetails) {
      const verified = await bcrypt.compare(oldPassword, userdetails.password);

      if (verified && newPassword === confirmPassword) {
        const secured = await securePassword(newPassword);

        if (secured) {
          await User.findOneAndUpdate({ _id: userid }, { $set: { password: secured } });
        }
      }
    } else {
      res.send("User Not found");
    }

    res.redirect('/userProfile');
  } catch (error) {
    console.error(error);
  }
};

//shop

const getShopPage = async (req, res) => {
  try {
    const user = req.session.user;
    console.log(user, "working");
    const currentPage = parseInt(req.query.page) || 1; //default from 1
    const pageSize = 9;
    const totalProducts = await product.countDocuments({ isBlocked: false })
    const totalPages = Math.ceil(totalProducts / pageSize)

    const categories = await Category.find({ isListed: true })
    const products = await product.find({ isBlocked: false }).skip((currentPage - 1) * pageSize).limit(pageSize).populate('category')
    const pagination = {
      currentPage, pageSize, totalPages, hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
    res.render('user/shop', { categories, products, user, pagination })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }

}
//............................................................
const searchProducts = async (req, res) => {
  try {
    const user = req.session.user;
    const search = req.query.query || '';
    const category = req.query.id || null;
    console.log(category,"searchcategory");
    const gt = parseFloat(req.query.gt) || 0;
    const lt = parseFloat(req.query.lt) || Infinity;

    console.log(search, "search query");

    const categories = await Category.find({ isListed: true });

    let productQuery = {
      isBlocked: false,
      price: { $gt: gt, $lt: lt },
      productName: { $regex: search, $options: 'i' }
    };

    if (category) {
      productQuery.category = category;
    }

    let products;
    if(req.query.query && req.query.id){
      products =await product.find({category:category,productName:search})
    }
    if (req.query.sort === 'pricelowToHighProducts') {
      products = await product.find(productQuery).sort({ price: 1 })
    } else if (req.query.sort === 'priceHighToLowProducts') {
      products = await product.find(productQuery).sort({ price: -1 })
    } else {
      products = await product.find(productQuery)
    }

    console.log("products", products);

    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 9;
    const totalProducts = await product.countDocuments(productQuery);
    const totalPages = Math.ceil(totalProducts / pageSize);
    const pagination = {
      currentPage,
      pageSize,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };

    res.render('user/search', { user, categories, pagination, totalPages, products, search, selectedCategory: category, query: req.query });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//.........................................................................

const filterByPrice = async (req, res) => {
  try {
    const user = req.session.user
    const categories = await Category.find({ isListed: true })
    const products = await product.find({
      $and: [
        { price: { $gt: req.query.gt } },
        { price: { $lt: req.query.lt } },
        { isBlocked: false }
      ]
    })

    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 9;

    const totalProducts = await product.countDocuments({ isBlocked: false })
    const totalPages = Math.ceil(totalProducts / pageSize)
    const pagination = {
      currentPage, pageSize, totalPages, hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
    res.render('user/shop', { user, categories, products, pagination, totalProducts })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Servver Error")

  }

}
//......................................................


const filterByCategory = async (req, res) => {
  console.log("diecast");
  try {
    const user = req.session.user;
    const category = req.query.id || null;
    const gt = parseFloat(req.query.gt) || 0;
    const lt = parseFloat(req.query.lt) || Infinity;
    const searchQuery=req.query.search|| '';
     console.log(searchQuery,"searrchhh");
    const categories = await Category.find({ isListed: true });

  let productQuery={
  category:category,
  price:{$gt:gt,$lt:lt},
  productName:{$regex:searchQuery,$options:'i'},
  isBlocked:false
  };


  let products;

  if (req.query.sort === 'pricelowToHighProducts') {
    products = await product.find(productQuery).sort({ price: 1 });
  } else if (req.query.sort === 'priceHighToLowProducts') {
    products = await product.find(productQuery).sort({ price: -1 });
  } else {
    products = await product.find(productQuery);
  }

    console.log("proucts", products);
    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 9;
    const totalProducts = await product.countDocuments(productQuery);
    const totalPages = Math.ceil(totalProducts / pageSize);
    const pagination = {
      currentPage, pageSize, totalPages, hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };

    res.render('user/filterShop', { user, categories, pagination, totalPages, products, selectedCategory: category, query: req.query });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

//...........................................................
const sortProductsAtoZ = async (req, res) => {
  try {

    const user = req.session.user;
    // const ProductId=req.query.id
    // console.log(ProductId,"rrr");
    const products = await product.find({}).sort({ productName: 1 })
    console.log(products, "fury");
    const categories = await Category.find({ isListed: true })

    const currentPage = req.query.page || 1;
    const pageSize = 9;
    const totalProducts = await product.countDocuments({ isBlocked: false })
    const totalPages = Math.ceil(totalProducts / pageSize)
    const pagination = {
      currentPage, pageSize, totalPages, hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };


    res.render('user/shop', { user, products, categories, pagination, totalPages })
  } catch (error) {
    console.error
    res.status(500).send("Internal Server Error")
  }

}
//.................................................................
const sortProductsZtoA = async (req, res) => {
  try {
    const user = req.session.user;
    const products = await product.find({}).sort({ productName: -1 })
    console.log(products, "vein");
    const categories = await Category.find({ isListed: true });

    const currentPage = req.query.page || 1
    const pageSize = 9;
    const totalProducts = await product.countDocuments({ isBlocked: false })
    const totalPages = Math.ceil(totalProducts / pageSize)
    const pagination = {
      currentPage, pageSize, totalPages, hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };

    res.render('user/shop', { user, products, categories, pagination, totalPages })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }

}
//.........................................................

const sortPricesToHigh = async (req, res) => {
  try {
    const user = req.session.user;
    const category = req.query.id




    const products = await product.find({}).sort({ price: 1 });
    const categories = await Category.find({ isListed: true });
    const currentPage = req.query.page || 1
    const pageSize = 9;
    const totalProducts = await product.countDocuments({ isBlocked: false });
    const totalPages = Math.ceil(totalProducts / pageSize)
    const pagination = { currentPage, pageSize, totalPages, hasNextPage: currentPage < totalPages, hasPreviousPage: currentPage > 1, };

    res.render('user/shop', { user, products, categories, totalPages, pagination, selectedCategory: category })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
}

const sortPricesToLow = async (req, res) => {
  try {
    const user = req.session.user;
    const products = await product.find({}).sort({ price: -1 })
    const categories = await Category.find({ isListed: true });
    const currentPage = req.query.page || 1;
    const pageSize = 9
    const totalProducts = await product.countDocuments({ isBlocked: false });
    const totalPages = Math.ceil(totalProducts / pageSize)
    const pagination = { currentPage, pageSize, totalPages, hasNextPage: currentPage < totalPages, hasPreviousPage: currentPage > 1, };


    res.render('user/shop', { user, products, categories, pagination, totalPages })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }

}

const applyCoupon = async (req, res) => {
  try {
    console.log('entered in the function controller')
    const userId = req.session.user;
    const { couponCode } = req.body
    const coupons = await Coupon.findOne({ couponCode: couponCode })
    console.log('coupons', coupons)
    console.log('Top level')
    if (!coupons) {
      return res.status(400).json({ errorMessage: "Invalid Coupon Entered" });
    }

    if (coupons.userId.includes(userId)) {
      return res.status(400).json({ errorMessage: "You Already Used This Coupon" });
    }

    const currentDate = new Date();
    const expireDateParts = coupons.expireOn.split('-');
    const expireDate = new Date(expireDateParts[2], expireDateParts[1] - 1, expireDateParts[0]);

    if (coupons.expireOn && currentDate > expireDate) {
      return res.status(400).json({ errorMessage: "Coupon Expired" });
    }

    console.log('Ist level')

    const totalPrice = parseInt(req.body.totalPrice);
    console.log(totalPrice)
    console.log('2nd level')

    if (totalPrice < coupons.minimumPrice) {
      return res.status(400).json({ errorMessage: "Order amount does not meet the minimum purchase requirement for this coupon" });
    }


    const discountedTotal = Math.floor(totalPrice - coupons.offerPrice);
    // Update coupon usage for the user



    console.log(coupons.userId, 'Array of values')
    return res.json({
      success: true,
      discounted: discountedTotal,
      reduction: totalPrice - coupons.offerPrice,
      discount: coupons.offerPrice
    });
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }

}

module.exports = {
  loadregister,
  insertUser,
  loginload,
  loguser,
  logoutuser,
  loaduserHome,
  loaduserAccount,
  loadotp,
  getOtp,
  verifyOtp,
  resendOtp,
  cartPage,
  addCart,
  increaseQuantity,
  decreaseQuantity,
  productRemoveFromCart,
  userProfile,
  getAddress,
  addAddress,
  geteditAddress,
  editAddress,
  getDeleteAddress,
  getEditProfile,
  editProfile,
  changePasswordPage,
  getShopPage,
  searchProducts,
  filterByPrice,
  filterByCategory,
  sortProductsAtoZ,
  sortProductsZtoA,
  sortPricesToHigh,
  sortPricesToLow,
  applyCoupon,
  forgetPass,
  getpasswordReset,
  forgotPassword,
  resetPassword
};

