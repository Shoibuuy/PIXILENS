// adminController.js
const user = require('../model/userModel');

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
        res.render('adminDash');
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