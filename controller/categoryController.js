const CategoryModel = require("../model/categoryModel");
const product = require("../model/productModel");


const getCategoryPage = async (req, res) => {
  try {
    const categories = await CategoryModel.find({});
    res.render("admin/category", { categories });
  } catch (err) {
    console.log(err.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const upperCaseName = name.toUpperCase(); // Convert to Uppercase
      console.log(upperCaseName,"dffd");
    const existingCategory = await CategoryModel.findOne({ name: upperCaseName });
    if (!existingCategory) {
      const newCategory = new CategoryModel({
        name:upperCaseName,
        description
      });
      await newCategory.save();
      res.redirect('/admin/category');
    } else {
      console.log('exists');
      const categories = await CategoryModel.find({});
      
      res.render('admin/category',{error:"Category Already Exists",categories});
    }
  } catch (error) {
    console.error("Error adding Category:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//..........................................
const getEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await CategoryModel.findOne({ _id: id });
    console.log(category);
    res.render('admin/edit-category', { category: category });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Internal Server Error');
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(req.body);
    const findCategory = await CategoryModel.findById(id);
    if (findCategory) {
      await CategoryModel.updateOne(
        { _id: id },
        {
          name: req.body.name,
          description: req.body.description,
        }
      );
      res.redirect("/admin/category");
    } else {
      console.log("Category not found");
    }
  } catch (error) {
    console.error("Error editing Category:", error);
    res.redirect("/error");
  }
};

const getBlockCategory = async (req, res) => {
  try {
    let id = req.params.id;
    console.log(id);
    await CategoryModel.updateOne({ _id: id }, { $set: { isListed: false } });
    await product.updateMany({category:id},{$set:{isBlocked:true}});
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const getUnblockCategory = async (req, res) => {
  try {
    let id = req.params.category;
    console.log(id);
    console.log("it is working");
    await CategoryModel.findByIdAndUpdate({ _id: id }, { $set: { isListed: true } });
    await product.updateMany({category:id},{$set:{isBlocked:false}});
    res.status(200).json({ success: true });
  } catch (error) {
    res.redirect("/pageerror");
  }
};

module.exports = {
  getCategoryPage,
  addCategory,
  getEditCategory,
  editCategory,
  getBlockCategory,
  getUnblockCategory
};
