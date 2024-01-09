const fs = require ('fs');
const path = require('path');
const sharp = require('sharp');
const Product = require("../model/productModel");
const { find } = require("../model/categoryModel");
const categoryModel = require("../model/categoryModel");

// ! Loading Add Product Page
const loadAddproduct = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.render("addProduct", { message: "" ,category: category});
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductList = async (req, res) => {
  try {
    const itemsPerPage = 5;
    let currentPage = parseInt(req.query.page, 10) || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    let query = {};
    const searchQuery = req.query.search;

    if (searchQuery) {
      query = {
        $or: [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { category: { $regex: new RegExp(searchQuery, 'i') } },
        ],
      };
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const productData = await Product.find(query)
      .skip(skip)
      .limit(itemsPerPage);

    res.render('productList', {
      productData,
      currentPage,
      totalPages,
      range: Array.from({ length: totalPages }, (_, i) => i + 1),
      search: searchQuery,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};




// ! inserting Product
const addProduct = async (req, res) => {
  try {
      const productExist = await Product.findOne({
          name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
      });

      const product = new Product({
      name: req.body.name,
      shape: req.body.shape,
      color: req.body.color,
      type: req.body.type,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      discountPrice: req.body.discount_price,
      category: req.body.category,
      material: req.body.material,
      quantity: req.body.quantity,
      isOutOfStock: req.body.quantity <= 0,
    });
  

    if (req.files) {
      product.productImages = [];

      for (let i = 1; i <= 4; i++) {
        const fieldName = `image${i}`;

        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];

          const image = sharp(file.path);

          const metadata = await image.metadata();
          const width = metadata.width;
          const height = metadata.height;

          const aspectRatio = width / height;

          const targetSize = { width: 679, height: 679 };

          if (width > targetSize.width || height > targetSize.height) {
            image.resize({ width: targetSize.width, height: targetSize.height, fit: 'cover' });
          } else {
            image.resize(targetSize.width, targetSize.height);
          }

          const tempFilename = `${file.filename.replace(/\.\w+$/, '')}_${Date.now()}.jpg`;

          const resizedImagePath = path.join(__dirname, '../public/productImages', tempFilename);

          await image.toFile(resizedImagePath);

          product.productImages.push(tempFilename);
        }
      }
    }
    

    if (productExist) {
      return res.render("addProduct", {productData, message: "Product Already Exists" });
    } else {
      await product.save();
      res.redirect("/admin/productList");
    }



  } catch (error) {
    console.error(error.message);
  }
};



//! Load Edit Product Page
const loadEditProduct = async (req, res) => {
  try {
    const productName = req.query.id;
    const category = await categoryModel.find({});
    const productData = await Product.findOne({ _id: productName });

    res.render('editProduct', { productData, category: category, message: '' });
  } catch (error) {
    console.log(error.message);
  }
};


//! Edit and Update products
const editAndUpdateProduct = async(req, res)=>{

  try {

   const id = req.body.product_id
   const  updateData = await Product.findById(id);
   const productExist = await Product.findOne({ _id: { $ne: id },name:req.body.name});
   const existingImages = updateData.productImages;
   if(productExist){
    res.render('editProduct', {productData : updateData , message : "Product With Same Name Is already Exist"});
   }else {

    if(req.body.name){
       updateData.name = req.body.name
    }
    if(req.body.description){
       updateData.description = req.body.description
    }
    if(req.body.shape){
       updateData.shape = req.body.shape
    }
    if(req.body.color){
       updateData.color = req.body.color
    }
    if(req.body.type){
       updateData.type = req.body.type
    }
    if(req.body.brand){
       updateData.brand = req.body.brand
    }
    if(req.body.category){
       updateData.category = req.body.category
    }
    if(req.body.price){
       updateData.price = req.body.price
    }
    if(req.body.quantity){
       updateData.quantity = req.body.quantity
    }
    if(req.body.discount){
       updateData.discountPrice = req.body.discount
    }
    if(req.body.material){
       updateData.material = req.body.material
    }
    if (req.files) {
      for (let i = 1; i <= 4; i++) {
        const fieldName = `image${i}`;

        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];

          const image = sharp(file.path);

          const metadata = await image.metadata();
          const width = metadata.width;
          const height = metadata.height;

          const targetSize = { width: 679, height: 679 };


          if (width > targetSize.width || height > targetSize.height) {
            image.resize({ width: targetSize.width, height: targetSize.height, fit: 'cover' });
          } else {
            image.resize(targetSize.width, targetSize.height);
          }


          const tempFilename = `${file.filename.replace(/\.\w+$/, '')}_${Date.now()}.jpg`;
          const editedImagePath = path.join(__dirname, '../public/productImages', tempFilename);
          await image.toFile(editedImagePath);

          updateData.productImages[i - 1] = tempFilename;
        }
      }
    }

  await  updateData.save();
  res.redirect('/admin/productList');

   }
   
    
  } catch (error) {
  
    console.log(error.message)
    
  }

}

//! Delete Product Image
const deleteProductImage = async (req, res) => {
  try {
    const productId = req.query.id;
    const imageIndex = parseInt(req.query.imageIndex);

    const product = await Product.findById(productId);
    const category = await categoryModel.find({});

    const imageToDelete = product.productImages[imageIndex];


    product.productImages.splice(imageIndex, 1);

    await product.save();

    const imagePath = path.join(__dirname, '../public/productImages', imageToDelete);
    try {
      fs.unlinkSync(imagePath);
      console.log('Image deleted successfully:', imagePath);
    } catch (unlinkError) {
      console.error('Error deleting image file:', unlinkError.message);
    }
    res.render('editProduct', { productData: product, category , message: '' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};



// ! product info page
const productViewInfo = async (req, res) => {
  try {
      const id = req.query.id;
      const products = await Product.findOne({_id : id});
      res.render('productView', { products })
  } catch (error) {
      console.log(error.message);
  }
}

const unlistProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    await Product.updateOne({ _id: productId }, { $set: { isListed: false } });
    res.redirect('/admin/productList');
  } catch (error) {
    console.log(error.message);
  }
};

// ! List Product 

const listProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    await Product.updateOne({ _id: productId }, { $set: { isListed: true } });
    res.redirect('/admin/productList');
  } catch (error) {
    console.log(error.message);
  }
};




//** USER SIDE PRODUCT CONTROLLER */

const userProductList = async (req, res) => {
  try {
    const user = req.session.userId;
    let { page, sort, search } = req.query;

    const perPage = 6;
    let filterCriteria = { isListed: true };

    if (search) {
      filterCriteria = {
        $or: [
          { name: { $regex: new RegExp(`\\b${search}\\b`, 'i') } },
          { category: { $regex: new RegExp(`\\b${search}\\b`, 'i') } },
          { brand: { $regex: new RegExp(`\\b${search}\\b`, 'i') } },
        ],
      };
    }

    const priceRanges = {
      under1K: { min: 0, max: 1000 },
      "1Kto1.5k": { min: 1000, max: 1500 },
      "1.5Kto2K": { min: 1500, max: 2000 },
      "2Kto2.5K": { min: 2000, max: 2500 },
      "2.5Kabove": { min: 2500, max: Number.MAX_VALUE },
    };

    // Handle Price Range Filter
    const priceRangeQuery = req.query.pricerange;
    let priceRangeFilter = {};

    if (priceRangeQuery && priceRanges[priceRangeQuery]) {
      priceRangeFilter = {
        discountPrice: {
          $gte: priceRanges[priceRangeQuery].min,
          $lt: priceRanges[priceRangeQuery].max,
        },
      };
    }

    // Merge the existing filterCriteria with priceRangeFilter
    filterCriteria = { ...filterCriteria, ...priceRangeFilter };

    const totalProducts = await Product.countDocuments(filterCriteria);

    let sortOption = {};
    if (sort) {
      if (sort === '1') {
        sortOption = { discountPrice: 1 };
      } else if (sort === '-1') {
        sortOption = { discountPrice: -1 };
      }
    } else {
      sortOption = { featured: -1 };
    }

    const currentPage = +page;
    const totalPages = Math.ceil(totalProducts / perPage);

    const productData = await Product.find(filterCriteria)
      .sort(sortOption)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const categoryData = await categoryModel.find({});

    const selectedFilters = {
      category: req.query.category ? req.query.category : req.query.searchcategory || [],
      type: req.query.type ? req.query.type : req.query.searchtype || [],
      shape: req.query.shape ? req.query.shape : req.query.searchshape || [],
      material: req.query.material ? req.query.material : req.query.searchmaterial || [],
      brand: req.query.brand ? req.query.brand : req.query.searchbrand || [],
      priceRange: priceRangeQuery || '',
    };

    res.render('userProductList', {
      user,
      productData,
      priceRanges,
      totalProducts,
      categoryData,
      selectedFilters,
      currentPage,
      totalPages,
      sortingParameter: sort,
      search,
      req,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};





//!Prouct Page 
const loadProductPage = async ( req , res )=>{

  try {

    const user = req.session.userId;
    const id = req.query.id
    const relatedProducts = await Product.find({_id : { $ne : id}}).limit(4);
    const productData = await Product.find({_id : id});
    res.render('productPage',{user,relatedProducts,productData})
    
  } catch (error) {
    
    console.log(error.message);

  }

}




module.exports = {
  loadProductList,
  loadAddproduct,
  addProduct,
  loadEditProduct,
  editAndUpdateProduct,
  deleteProductImage,
  productViewInfo,
  unlistProduct,
  listProduct,
  userProductList,
  loadProductPage
};