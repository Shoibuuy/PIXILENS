const express = require('express');
const session = require('express-session');
const adminController = require('../controller/adminController');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const bannerController = require('../controller/bannerController')
const auth = require('../middleware/adminAuth');
const userManage = require('../middleware/userManage')
const multer = require('multer');
// const multerMiddleware = require('../helpers/multer');
const config = require('../config/session');
const path = require('path');
const admin_route = express();
admin_route.use(express.static('public'));

// ! session setup
admin_route.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
}));

// ! storage for category images
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/adminassets/imgs/categoryImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  }
});
const categoryUpload = multer({ storage: categoryStorage });



// ! storage for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/productImages'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});


const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]);

// ! multer for banner
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../public/bannerImages"));
  },
  filename: (req, file, cb) => {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
  },
});
const bannerUpload = multer({ storage: bannerStorage });



admin_route.set('views', './views/admin');
admin_route.use(express.urlencoded({ extended: true }));
admin_route.use(express.json());



//**GET REQUEST 
//!for Admin
admin_route.get('/',auth.isLogout ,adminController.adminLogin);
admin_route.get('/adminDash', auth.isLogin, adminController.loadDash);
admin_route.get('/userList', auth.isLogin, adminController.userLoad);
admin_route.get('/logout' , auth.isLogin, adminController.adminLogout)

// !Category 
admin_route.get('/addCategory', auth.isLogin, categoryController.loadAddCategories);
admin_route.get('/categoryList', auth.isLogin, categoryController.loadCategoryList);
admin_route.get('/editCategory', auth.isLogin, categoryController.editCategory);
admin_route.get('/unlistCat', auth.isLogin, categoryController.unlistCategory);
admin_route.get('/listCat', auth.isLogin, categoryController.listCategory);


//!Proudct
admin_route.get('/productList', auth.isLogin, productController.loadProductList);
admin_route.get('/addProduct',auth.isLogin,productController.loadAddproduct);
admin_route.get('/editProduct', auth.isLogin , productController.loadEditProduct);
admin_route.get('/productimagedelete', auth.isLogin , productController.deleteProductImage);
admin_route.get('/productView', auth.isLogin , productController.productViewInfo);
admin_route.get('/unlistProduct', auth.isLogin , productController.unlistProduct);
admin_route.get('/listProduct', auth.isLogin , productController.listProduct);

// ! Order
admin_route.get('/orderList', auth.isLogin, orderController.listUserOrders)
admin_route.get('/orderstatus', auth.isLogin, orderController.changeOrderStatus)
admin_route.get('/orderdetails', auth.isLogin, orderController.adminOrderDetails)
admin_route.get('/cancelProduct', auth.isLogin, orderController.produtCancel)
admin_route.get('/refundOrder', auth.isLogin, orderController.returnOrder)
admin_route.get("/transactionList", auth.isLogin, orderController.transactionList)
admin_route.get('/cancelOrder', auth.isLogin, orderController.orderCancel)

// ! Coupon
admin_route.get('/addCoupon', auth.isLogin, couponController.addCouponPage)
admin_route.get('/couponList', auth.isLogin, couponController.couponList)
admin_route.get('/couponUnlist', auth.isLogin, couponController.unlistCoupon)
admin_route.get('/couponDetails', auth.isLogin, couponController.couponDetails)
admin_route.get('/loadEditCoupon', auth.isLogin, couponController.loadEditCoupon)


// ! Banner 
admin_route.get("/bannerAdd", auth.isLogin, bannerController.loadBannerAdd);
admin_route.get("/bannerList", auth.isLogin, bannerController.bannerList);
admin_route.get("/bannerEdit", auth.isLogin, bannerController.loadBannerEdit);
admin_route.get('/blockBanner', auth.isLogin, bannerController.blockBanner)



//**POST requests 
//!for Admin
admin_route.post('/', adminController.adminVerify);
admin_route.post('/blockUser/:userId', userManage.blockUser, adminController.blockUser);
admin_route.post('/unblockUser/:userId', userManage.unblockUser, adminController.unblockUser);

// !Category
admin_route.post('/addCategory', auth.isLogin, categoryUpload.single('image'), categoryController.addCategories);
admin_route.post('/editCategory', auth.isLogin, categoryUpload.single('image'), categoryController.editAndUpdateCategory)


//!Proudct
admin_route.post('/addProduct',uploadFields,productController.addProduct );
admin_route.post('/editProduct',uploadFields , productController.editAndUpdateProduct);


// ! Coupon
admin_route.post('/addCoupon', couponController.insertCoupon)
admin_route.post('/loadEditCoupon', couponController.insertEditCoupon)

// ! Banner
admin_route.post("/bannerAdd", bannerUpload.single("image"), bannerController.addBanner);
admin_route.post("/bannerEdit", bannerUpload.single("image"), bannerController.bannerEdit);



module.exports = admin_route;