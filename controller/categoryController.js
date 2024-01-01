const Category = require('../model/categoryModel');

// Loading AddCategory Page
const loadAddCategories = async (req, res, next) => {
    try {
        res.render('addCategory');
    } catch (error) {
        console.log(error.message);
        next(error); 
    }
}

// Adding Category
const addCategories = async (req, res) => {
    try {
        const categoryName = req.body.category;

        const categoryExist = await Category.findOne({ category: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

        if (categoryExist) {
        
            return res.render('addCategory', { message: "Category Already Exists" });
        }

        const category = new Category({
            category: categoryName,
            description: req.body.description,
            image: req.file.filename,
            isListed: true
        });

        const categoryData = await category.save();

        if (categoryData) {           
            res.render('addCategory', { message: "Category Added Successfully" });
        } else {
            res.render('addCategory', { message: "Category adding is failed" });
        }
    } catch (error) {
        console.log(error.message);
        res.render('addCategory', { message: "An Error Occurred" });
    }
};


//!Loading Category list
const loadCategoryList = async (req, res) => {
    try {
        const search = req.query.search || ""; 
        const page = parseInt(req.query.page) || 1;
        const perPage = 4;
        const isBlocked = req.query.blocked;

        const filter = {
            $or: [
                { category: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } },
            ],
        };

        if (isBlocked === "true") {
            filter.isListed = false;
        } else if (isBlocked === "false") {
            filter.isListed = true;
        } else {
        
        }

        const totalCategories = await Category.countDocuments(filter);
        const totalPages = Math.ceil(totalCategories / perPage);

        const category = await Category.find(filter)
            .skip((page - 1) * perPage)
            .limit(perPage);
        res.render('categoryList', {  category, totalPages, currentPage: page});
    } catch (error) {
        console.log(error.message);
              
    }
}


//!Edit Category
const editCategory = async (req, res) => {
    try {
        const categoryName = req.query.id
        const categories = await Category.findOne({_id: categoryName})
        res.render('editCategory', { categories, message: "" });
        
    } catch (error) {
        console.log(error.message);
    }
}




// Update Edits in Category  
const editAndUpdateCategory = async (req, res) => {
    try {
      const id = req.body.category_id;
      const categoryExist = await Category.findOne({ _id: { $ne: id }, categories: { $regex: new RegExp(req.body.category, "i") } });
      const updateData = await Category.findById(id);
      if (categoryExist) {
        res.render('editCategory', { categories: updateData, message: 'Category with the same name exists, try another name' });
      } else {
  
        if (req.body.category) {
          updateData.category = req.body.category;
        }
  
        if (req.body.description) {     
          updateData.description = req.body.description;
        }
  
        if (req.file) {
          updateData.image = req.file.filename;
        }
  
        await updateData.save();
        res.redirect("/admin/categoryList");
      }
    } catch (error) {
      console.log(error);
    }
  }


  //!Unlist Category

  const unlistCategory = async (req,res)=>{

    try {

        const catId = req.query.id;
        await Category.updateOne({_id:catId},{$set:{isListed:false}});
        res.redirect('/admin/categoryList')
        
    } catch (error) {
        console.log(error.message);
    }

  }

  //! List Category
  const listCategory = async (req,res)=>{

    try {

        const catId = req.query.id;
        await Category.updateOne({_id:catId},{$set:{isListed:true}});
        res.redirect('/admin/categoryList')
        
    } catch (error) {
        console.log(error.message);
    }

  }





module.exports = {
    loadAddCategories,
    addCategories,
    loadCategoryList,
    editCategory,
    editAndUpdateCategory,
    unlistCategory,
    listCategory
}
