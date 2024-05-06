
const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const cart = require('../model/cartModel')
const product = require("../model/productModel");
const Wishlist = require('../model/wishlistModel')


const getWishlist = async (req, res) => {
    try {
        const userId=req.session.user
        let wishlist = await Wishlist.findOne({ userId}).populate('items.product')
        res.render("user/userWishlist",{wishlist,userId,})
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }

}

const addWishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        const productId = req.query.id;
        const quantity = parseInt(req.body.quantity);
        let wishlist = await Wishlist.findOne({ userId })
        if (!wishlist) {
            console.log('hi')
            wishlist = new Wishlist({ userId, items: [{ product: productId, quantity }] })
            console.log('wishlist', wishlist)
            await wishlist.save()
            res.status(200).json({ success: 'success' })
            return
        }
        
        const existingProductIndex = wishlist.items.findIndex(item => item.product.toString() === productId);
        console.log(existingProductIndex);
        if (existingProductIndex != -1) {
            wishlist.items[existingProductIndex].quantity += quantity;
            console.log("kk");
            res.status(200).json({warning:'Item Already Been in Wishlist'})  
        } else {
            wishlist.items.push({ product: productId, quantity })
            await wishlist.save();
            res.status(200).json({ success: 'success' })
        }
        console.log("wishlist", wishlist)

    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }

}

const deleteWishlist=async(req,res)=>{
    try {
        const userId = req.session.user;
        const productId = req.query.id;

        let wishlist = await Wishlist.findOne({ userId })
        wishlist.items=wishlist.items.filter((item)=>{

       return item.product.toString()!==productId

        })
        await wishlist.save()
        return res.json({success:true})
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }

}

module.exports = {
    getWishlist,
    addWishlist,
    deleteWishlist

}