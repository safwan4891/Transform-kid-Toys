require('dotenv').config({path:'.env'})
const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const session=require('../middleware/session')
const productController=require('../controller/productController')
const orderController=require('../controller/orderController')
const wishlistController=require('../controller/wishlistController')
const { Session } = require('session')


router.get('/login',session.is_userlogout,userController.loginload)
router.post('/login',session.is_userlogout,userController.loguser)
router.get('/Sign-Up',userController.loadregister)
router.post('/Sign-Up',userController.insertUser)
router.get('/logout',userController.logoutuser)
router.get('/',userController.loaduserHome)
router.get('/useraccount',session.is_userlogin,userController.loaduserAccount)
router.get('/product-Detail',session.is_userlogin,productController.productDetails)


//cart
router.get('/getcart',session.is_userlogin,userController.cartPage)
router.post('/addCart',session.is_userlogin,userController.addCart)
router.get('/quantityIncrease',session.is_userlogin,userController.increaseQuantity)
router.get('/quantityDecrease',session.is_userlogin,userController.decreaseQuantity)
router.get('/deleteCart',session.is_userlogin,userController.productRemoveFromCart)



//userProfile and address
router.get('/userprofile',session.is_userlogin,userController.userProfile)
router.get('/getAddress',session.is_userlogin,userController.getAddress)
router.post('/addAddress',session.is_userlogin,userController.addAddress)
router.get('/geteditAddress',session.is_userlogin,userController.geteditAddress)
router.post('/editAddress',session.is_userlogin,userController.editAddress)
router.get('/deleteAddress',session.is_userlogin,userController.getDeleteAddress)
router.get('/getEditProfile',session.is_userlogin,userController.getEditProfile)
router.post('/editProfile',session.is_userlogin,userController.editProfile)
router.post('/changePassword',session.is_userlogin,userController.changePasswordPage)

//otp verification route
router.get('/loadotp',userController.loadotp)

router.get('/getOtp',userController.getOtp)
router.post('/verifyOtp',userController.verifyOtp)
router.get('/resendOtp',userController.resendOtp)


//Checkout and order
router.get('/getCheckout',session.is_userlogin ,orderController.getCheckoutPage)
router.post('/orderPlaced',session.is_userlogin,orderController.orderPlaced)
router.get('/placedOrder',session.is_userlogin,orderController.orderSucess)
router.get('/orderDetail',session.is_userlogin,orderController.orderDetailPageUser)
router.patch('/orderCancelled',session.is_userlogin,orderController.userOrderCancel)
router.patch('/orderReturned',session.is_userlogin,orderController.returnOrder)
router.post('/verifyPayment',session.is_userlogin,orderController.verifyPayment)
router.post('/paymentfailed',session.is_userlogin,orderController.paymemtFailure)
router.post('/payAgain',session.is_userlogin,orderController.payAgain)
router.post('/payAgainVerifyPayment',session.is_userlogin,orderController.payAgainVerifyPayment)

// router.post('/confirm',session.is_userlogin,orderController.paymentConfirm)

//shop
router.get('/shop',session.is_userlogin,userController.getShopPage)
router.post('/search',session.is_userlogin,userController.searchProducts)
router.get('/filterPrice',session.is_userlogin,userController.filterByPrice)
router.get('/filterCategory',session.is_userlogin,userController.filterByCategory)
router.get('/sortbyletter',session.is_userlogin,userController.sortProductsAtoZ)
router.get('/sortbyDescending',session.is_userlogin,userController.sortProductsZtoA)
router.get('/sortPricetoHigh',session.is_userlogin,userController.sortPricesToHigh)
router.get('/sortPricetoLow',session.is_userlogin,userController.sortPricesToLow)


//Wishlist
router.get('/getwishlist',session.is_userlogin,wishlistController.getWishlist)
router.get('/addwishlist',session.is_userlogin,wishlistController.addWishlist)
router.get('/deletewishlist',session.is_userlogin,wishlistController.deleteWishlist)




//coupon
router.post('/applycoupon',session.is_userlogin,userController.applyCoupon)



module.exports = router 