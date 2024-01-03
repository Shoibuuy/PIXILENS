// adminController.js
const user = require('../model/userModel');
const {} = require("../helpers/chartDate");
const Order = require('../model/orderModel');
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const {
    getMonthlyDataArray,
    getDailyDataArray,
    getYearlyDataArray,
  } = require("../helpers/chartDate");
  
  require("dotenv").config();


const adminLogin = async (req, res) => {
    try {
        res.render('adminLogin', { message: '' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

//! adminVerify
const adminVerify = async (req, res) => {
    try {
        const adminEmail = "shuhaibmohd439@gmail.com";
        const adminPassword = "1234";

        const enteredEmail = req.body.email;
        const enteredPassword = req.body.password;

        if (enteredEmail === adminEmail && enteredPassword === adminPassword) {
            req.session.admin_id=adminEmail
            res.redirect('/admin/adminDash');
        } else {
            res.render('adminLogin', { message: 'Incorrect email or password' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//! Dash Boad Loading
const loadDash = async (req, res) => {
    try {
      const [
        totalRevenue,
        totalUsers,
        totalOrders,
        totalProducts,
        totalCategories,
        orders,
        monthlyEarnings,
        newUsers,
      ] = await Promise.all([
        Order.aggregate([
          { $match: { paymentStatus: "Payment Successful" } },
          { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
        ]),
        user.countDocuments({ is_blocked: false, is_varified: 1 }),
        Order.countDocuments(),
        Product.countDocuments(),
        Category.countDocuments(),
        Order.find().limit(10).sort({ orderDate: -1 }),
        Order.aggregate([
          {
            $match: {
              paymentStatus: "Payment Successful",
              orderDate: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          },
          { $group: { _id: null, monthlyAmount: { $sum: "$totalAmount" } } },
        ]),
        user.find({ is_blocked: false, is_verified: 1 })
          .sort({ date: -1 })
          .limit(5),
      ]);
  
      const adminData = req.session.adminData;
      const totalRevenueValue =
        totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0;
      const monthlyEarningsValue =
        monthlyEarnings.length > 0 ? monthlyEarnings[0].monthlyAmount : 0;
      // Get monthly data
      const monthlyDataArray = await getMonthlyDataArray();
  
      // Get daily data
      const dailyDataArray = await getDailyDataArray();
  
      // Get yearly data
      const yearlyDataArray = await getYearlyDataArray();
  
      res.render('adminDash', {
        admin: adminData,
        orders,
        newUsers,
        totalRevenue: totalRevenueValue,
        totalOrders,
        totalProducts,
        totalCategories,
        totalUsers,
        monthlyEarnings: monthlyEarningsValue,
        monthlyMonths: monthlyDataArray.map((item) => item.month),
        monthlyOrderCounts: monthlyDataArray.map((item) => item.count),
        dailyDays: dailyDataArray.map((item) => item.day),
        dailyOrderCounts: dailyDataArray.map((item) => item.count),
        yearlyYears: yearlyDataArray.map((item) => item.year),
        yearlyOrderCounts: yearlyDataArray.map((item) => item.count),
      });
    } catch (error) {
      console.log(error.message);
    }
  };


//! admin logout
const adminLogout = async (req, res )=>{

    try {

    delete req.session.admin_id;
    res.redirect('/admin')
        
    } catch (error) {
        console.log(error.message)
    }

}

//!Loading Users


const userLoad = async (req, res) => {
    const ITEMS_PER_PAGE = 10;
    try {
        const page = parseInt(req.query.page) || 1;

        const totalUsers = await user.countDocuments({});
        const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

        const skip = (page - 1) * ITEMS_PER_PAGE;

        const userData = await user.find({}).skip(skip).limit(ITEMS_PER_PAGE);

        res.render('userList', { userData, totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
    }
};


//!Blocking User
const blockUser = async (req, res) => {
    try {
        const userId = req.params.userId; 
        await user.findByIdAndUpdate(userId, { is_blocked: 1 });
        
        res.redirect('/admin/userList');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

//! Unblocking User
const unblockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        await user.findByIdAndUpdate(userId, { is_blocked: 0 });
        res.redirect('/admin/userList');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};




module.exports = {
    adminLogin,
    adminVerify,
    loadDash,
    userLoad,
    blockUser,
    unblockUser,
    adminLogout    
}