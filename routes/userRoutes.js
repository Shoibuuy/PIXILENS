const express = require('express');
const user_route = express();
const session = require('express-session');
const userController = require('../controller/userController');
const productController = require('../controller/productController');
const cartController = require('../controller/cartController');
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
const wishlistController = require('../controller/wishlistController');
const couponController = require('../controller/couponController');
const config = require('../config/session');
const auth = require("../middleware/auth")


//** Set up session middleware 
user_route.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));


user_route.set('views', './views/user');
user_route.use(express.static('public'));




//** GET REQUESTS */
// ! FOR USER

user_route.get('/',auth.isLogout, userController.loadHome);
user_route.get('/login', auth.isLogout, userController.loadLogin);
user_route.get('/register', userController.loadRegister);
user_route.get('/home',auth.isBlocked, userController.loadHome);
user_route.get('/profile',auth.isBlocked, auth.isLogin, userController.userProfile);
user_route.get('/otpVerification', userController.otpControll);
user_route.get("/editProfile",auth.isBlocked, auth.isLogin, userController.loadEditProfile);
user_route.get('/changePassword', auth.isLogin, userController.loadUserPasswordReset);
user_route.get('/logout', auth.isLogin, userController.userLogout);
user_route.get('/resendOtp',userController.resendOtp);


// ! For Product 
user_route.get('/productList', productController.userProductList);
user_route.get('/productPage', productController.loadProductPage)


// ! For Cart 
user_route.get('/cartPage',auth.isBlocked, auth.isLogin, cartController.loadCart)
user_route.get('/removeCartItem',auth.isBlocked, auth.isLogin, cartController.removeCartItem)
user_route.get('/clearCart',auth.isBlocked, auth.isLogin, cartController.clearCart)

// ! address
user_route.get('/addAddress',auth.isBlocked, auth.isLogin, addressController.loadAdressPage);
user_route.get('/deleteAddress',auth.isBlocked, auth.isLogin, addressController.deleteAddress)
user_route.get('/editAddress',auth.isBlocked, auth.isLogin, addressController.editAddress)

// ! order
user_route.get('/checkoutPage',auth.isBlocked, auth.isLogin, orderController.checkoutPage)
user_route.get("/orderSuccess",auth.isBlocked, auth.isLogin, orderController.loadOrderSuccess);
user_route.get('/orderFailed',auth.isBlocked, auth.isLogin, orderController.orderFailed)
user_route.get('/userorderdetails',auth.isBlocked, auth.isLogin, orderController.userOrderDetails)
user_route.get('/cancelOrder',auth.isBlocked, auth.isLogin, orderController.changeOrderStatus)
user_route.get('/cancelSingleProduct',auth.isBlocked, auth.isLogin, orderController.changeOrderStatus)
user_route.get('/returnOrder',auth.isBlocked, auth.isLogin, orderController.changeOrderStatus)

// ! Coupon 
user_route.get('/couponPage',auth.isBlocked, auth.isLogin, couponController.couponPage)


// ! wishlist
user_route.get('/addTowishlist',auth.isBlocked, auth.isLogin, wishlistController.addToWishlist)
user_route.get('/wishlist',auth.isBlocked, auth.isLogin, wishlistController.loadWishlist)
user_route.get("/removeFromWishlist",auth.isBlocked, wishlistController.removeFromWishlist);

// ! Wallet 
user_route.get('/wallet',auth.isBlocked, auth.isLogin, userController.loadWallet)



//**POST REQUESTS  */
//! FOR USER
user_route.post('/register', userController.insertUser);
user_route.post('/verifyOtp', userController.verifyOtp);
user_route.post('/login', userController.verifyLogin);
user_route.post("/editUserProfile", userController.editProfile);
user_route.post('/userResetpassword', userController.userResetPassword)



// ! For Cart 
user_route.post('/productPage', auth.isLogin, cartController.insertToCart)
// ? Put Method
user_route.put('/updateQuantityAndSubtotal', cartController.updateQuantityAndSubtotal);

// ! For Address
user_route.post('/addAddress', addressController.addAddress);
user_route.post('/editAddress', addressController.insertEditAddress);
user_route.post('/userProductList', productController.userProductList);
user_route.post('/setDefaultAddress',addressController.setDefaultAddress)



// ! order
user_route.post('/postCheckout', orderController.postCheckout);
user_route.post('/applyCoupon', orderController.applyCoupon)
user_route.post('/razorpayOrder', orderController.razorpayOrder);



module.exports = user_route;
