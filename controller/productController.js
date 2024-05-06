const Product=require("../model/productModel");
const Category=require("../model/categoryModel");
const product = require("../model/productModel");




const getProductAddPage=async(req,res)=>{

  try{
    const categories=await Category.find({isListed:true})
    console.log("categories",categories)

   res.render('admin/productAdd',{categories})

  }catch(err){

    console.log(err.message);
  }
}


const addProducts=async(req,res)=>{

try{
  console.log(req.body,'bodyyy@ product controller')
const {productName,description,price,brand,mycategory,Stock}=req.body;


const existingProduct=await Product.findOne({productName})

if(existingProduct){

  return res.status(400).json({error:'Product already exists'});

}else{
const Images=req.files;
const imagefilename=Images.map(img=>img.filename);

console.log(mycategory,'cate')
  const newProduct = new Product( {
    productName:productName,
    description:description,
    price:price,
    brand:brand,
    productImage:imagefilename,
    category:mycategory,
    Stock: Stock

    
  })
  

   await newProduct.save(); 

   res.redirect('/admin/addProducts')
   
}


}catch(error){

console.error("Error adding Product:",error)
 res.status(500).json({error:'Internal Server Error'})

}
}
const load_editProduct=async(req,res)=>{
  try {
    const {id}=req.query
    const product=await Product.findById({_id:id})
    console.log(product)
    const categories=await Category.find({isListed:true})
    res.render('admin/edit-product',{product,categories})
  } catch (error) {
    console.error(error)
  }
}

const editProduct=async(req,res)=>{
  try {
    const {productName,description,price,brand,mycategory,Stock,id}=req.body
    console.log(id)
    let updateproduct;
    console.log(req.files,"rrr");
    if(req.files.length == 0){
      const newProduct = {
        productName:productName,
        description:description,
        price:price,
        brand:brand,
        category:mycategory,
        Stock: Stock     
    }
     updateproduct=await Product.findByIdAndUpdate({_id:id},{$set:newProduct})

  }
    else{
      const Images=req.files;
      const imagefilename=Images.map(img=>img.filename);
      
      console.log(mycategory,'cate')
        const newProduct =  {
          productName:productName,
          description:description,
          price:price,
          brand:brand,
          productImage:imagefilename,
          category:mycategory,
          Stock: Stock
      
          
        }
     updateproduct=await Product.findByIdAndUpdate({_id:id},{$set:newProduct})
        
      
    }
       res.redirect('/admin/addProducts')
  
 } catch (error) {
    console.error(error)
  }
}


const getProductList =async(req,res)=>{

try{  
  const page = parseInt(req.query.page) || 1;
const searchTerm=req.query.search||" ";
const limit=5;
const skip=(page-1)*limit;


const regexPattern=new RegExp(searchTerm,"i")
const products=await Product.find({productName:regexPattern}).skip((page-1)*limit).limit(limit).populate('category')   
        
console.log("products:",products);

const count=await Product.countDocuments({productName:regexPattern});
           

           const totalPage=Math.ceil(count/limit)

           console.log("All products");
           res.render("admin/product-list",{product:products,currentPage:page,totalPage:totalPage})
}catch(error){

console.log(error.message);
res.status(500).send("Internal server occured")

}
 }

const blockProduct=async(req,res)=>{
 try{
   const productId=req.params.productId;
   await Product.findByIdAndUpdate(productId,{isBlocked:true});
   console.log("product is blocked");
   res.redirect("/admin/products")
 }catch(error){
console.log("error blocking product",error.message);
 }


}

const unblockProduct=async(req,res)=>{

try{
const productId=req.params.productId;
await Product.findByIdAndUpdate(productId,{isBlocked:false});
console.log("Product is unblocked");
res.redirect("/admin/products")

}catch(error){

  console.log("error unblocking product",error);
}


}

const productDetails=async(req,res)=>{

try{
const productid=req.query.id;
const productDetail=await product.findById({_id:productid}).populate('category')
const categories=await Category.find({isListed:true})
console.log("products:",productDetail);
res.render('user/productdetail',{product:productDetail,categories})

}catch(err){

console.log(err.message);

}


}


const deleteSingleImage=async(req,res)=>{
try {
  const{imageName,productId}=req.body;
  const product=await Product.findByIdAndUpdate(productId,{
 $pull:{productImage:imageName}
  })
 console.log(imageName,"imgs");

res.status(200).json({success:true})

} catch (error) {
  console.error(error)
}

}








module.exports={
  getProductAddPage,
  addProducts,
  getProductList,
  blockProduct,
  unblockProduct,
  editProduct,
  load_editProduct,
 productDetails,
 deleteSingleImage
}