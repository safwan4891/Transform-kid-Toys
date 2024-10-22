const express = require('express')
const app = express()
const router = express.Router()
const adminController = require('../controller/adminController')
const nocache = require('nocache')
const productController=require('../controller/productController')
const upload=require('../utils/multer')
const categoryController=require('../controller/categoryController')
const orderController=require('../controller/orderController') 
const {islogin,isLogout}=require('../middleware/adminmiddleware')




////........................................................................


//admin
router.get('/',isLogout,adminController.displayLoginForm)
router.post('/',isLogout,adminController.login) 
router.get('/home',islogin,adminController.loadAdminhome)
router.get('/logout',adminController.getLogout)



//User management
router.get('/userList',islogin,adminController.userList)
router.get('/blockuser',islogin,adminController.userBlock)
router.get('/unblockuser',islogin,adminController.userUnblock)

//Product Managaement
router.get("/addProducts",islogin,productController.getProductAddPage)
router.post("/addproducts",islogin,upload.array("image",3),productController.addProducts)
router.get("/products",islogin,productController.getProductList)
router.get("/blockProduct/:productId",islogin,productController.blockProduct)
router.get("/unblockProduct/:productId",islogin,productController.unblockProduct)
router.get("/editProduct",islogin,productController.load_editProduct)
router.post("/editProduct",islogin,upload.array("image",3),productController.editProduct)
router.post("/deleteImage",islogin,productController.deleteSingleImage)


//category Management
router.get("/category",islogin,categoryController.getCategoryPage)
router.post("/category",islogin,categoryController.addCategory)
router.get("/edit-Category",islogin,categoryController.getEditCategory)
router.post("/edit-Category/:id",islogin,categoryController.editCategory)
router.get("/blockCategory",islogin,categoryController.getBlockCategory)
router.get("/api/block-category/:id",islogin,categoryController.getBlockCategory)  
router.post("/api/unblock-category/:category",islogin,categoryController.getUnblockCategory)   
 

 //order Management
 router.get("/orderlist",islogin,orderController.getOrderListPage) 
 router.get("/orderDetail",islogin,orderController.getOrderDetailPage)
 router.patch("/orderCancelled",islogin,orderController.adminOrderCancel)
router.patch('/orderDelivered',islogin,orderController.adminOrderDelivered)
router.patch('/approveReturn',islogin,orderController.approveReturn)

//Coupon Maangement
router.get("/addCoupon",islogin,adminController.getAddCouponPage)
router.get("/couponlist",islogin,adminController.couponList)
router.post("/Coupon",islogin,adminController.addCoupon)
router.get("/blockCoupon/:couponId",islogin,adminController.blockCoupon)
router.get("/unblockCoupon/:couponId",islogin,adminController.unblockCoupon)
router.get("/editCoupon",islogin,adminController.geteditCoupon)
router.post("/editCoupons",islogin,adminController.editCoupon)

//offer Management
router.get("/addOffer",islogin,adminController.getAddOfferPage)
router.get("/offerlist",islogin,adminController.offerList)
router.post("/addOffers",islogin,adminController.addOffer)
router.get("/blockoffer/:offerId",islogin,adminController.offerBlock)
router.get("/editoffer",islogin,adminController.geteditOffer)
router.post('/editOffer/:offerId',islogin,adminController.editOffer)

//salesReport
router.get("/getsalesReport",islogin,adminController.getSalesReport)
router.get("/getCustomSalesReport",islogin,adminController.getCustomSalesReport)




module.exports = router
