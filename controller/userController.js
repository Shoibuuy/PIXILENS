const user = require('../model/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const Category = require('../model/categoryModel');
const product = require('../model/productModel');
const address = require('../model/addressModel')
const order = require('../model/orderModel');
const Transaction = require('../model/transactionModel');
const Banner = require('../model/bannerModel');
require("dotenv").config();




// ! password hash
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

// ? node mailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});


// ! Loading Register Page
const loadRegister = async (req, res) => {
  try {
    res.render('registration', { user: req.session.userId, message: '' });
  } catch (error) {
    console.log(error.message);
  }
}

// ! inserting User
const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const User = new user({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: spassword,
    });

    const semail = await user.findOne({ email: User.email });

    if (semail) {
      return res.render('registration', { message: "Email already exists", user: req.session.userId });
    } else {
      const userData = await User.save();
      req.session.id2 = userData._id;
      req.session.email = userData.email;

      if (userData) {
        await sendOtpVerification(req, req.body.email);

        return res.redirect('/otpVerification');
      } else {
        return res.render('registration', { message: "Registration failed, try again" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.render('registration', { message: "An error occurred during registration, try again", user: req.session.userId });
  }
};


// !  Sending Otp for  Verification
const sendOtpVerification = async (req, email) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp);

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'Verify your email',
      html: `<p>Enter <b>${otp}</b> in the app to verify your account</p>
          <p>This OTP will expire in 1 hour</p>`
    };

    req.session.newOtp = otp
    req.session.otpGeneratedTime = Date.now();

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};


// ! verifying otp
const verifyOtp = async (req, res) => {
  try {
    const user = req.session.userId
    const { otp1, otp2, otp3, otp4 } = req.body;
    const otp = otp1 + otp2 + otp3 + otp4;
    console.log(otp)
    console.log(req.session.newOtp)


    if (otp == req.session.newOtp) {
      if (req.session.userId) {
        res.render('userPasswordChange', { user })
      } else {
        res.render('login', { message: "", user: null })
      }
      
      // const User = await user.findOne({ _id: User });
      // referrer.referredUsers.push(User.email);
      // referrer.walletBalance += 100;
      // await referrer.save();
      
    } else {
      const Email = req.session.email
      res.render('otpVerification', { Email, message: "Wrong Input" });
    }


  } catch (error) {
    res.json({
      status: "failed",
      message: error.message
    })
  }
}

// ! Resending Otp
const resendOtp = async (req, res) => {
  try {
    const otpGeneratedTime = req.session.otpGeneratedTime;
    const userId = req.session.id2;
    const userData = await user.findById(userId);
    if (userData) {

      sendOtpVerification(req, userData.email);

      res.render("otpVerification", {
        message: "OTP has been resent.",
       Email:userData.email,
      });
    } else {
      res.render("otpVerification", {
        message: "User not found",
        otpGeneratedTime: otpGeneratedTime,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ! Loading Login Page 
const loadLogin = async (req, res) => {
  try {
  
    const blocked = req.query.isBlocked || false;
    res.render('login', { message: "", user: null ,blocked});
  } catch (error) {
    console.log(error.message);
  }
}


// ! OTP Veirfication Controller
const otpControll = async (req, res) => {

  try {
    const Email = req.session.email
    res.render('otpVerification', { Email , message:''});

  } catch (error) {
    console.log(error.message);
  }

}

// ! Verifying User Login 
const verifyLogin = async (req, res) => {

  try {
    let blocked = false;
    const password = req.body.password
    const email = req.body.email

    const userData = await user.findOne({ email: email })
    if (userData) {
      if (userData.is_blocked) {
        return res.render('login', { message: "Your account is blocked. Please contact support.", user: null,blocked });
      }
      let passwordMatch = await bcrypt.compare(password, userData.password)
      if (passwordMatch) {
        req.session.userId = userData._id;
        res.redirect('/home')
      } else {
        res.render('login', { message: "Email and Password Do not Match", user: null ,blocked})
      }

    } else {
      res.render('login', { message: "Please Enter the Login Details Properly", user: null,blocked })
    }

  } catch (error) {
    console.log(error.message)
  }

}

// ! Loading Home Page 
const loadHome = async (req, res) => {

  try {
    const user = req.session.userId
    const categories = await Category.find({});
    const banData = await Banner.find({isListed : true})
    if (user) {
      res.render('home', { user, categories , banData });

    } else {
      res.render('home', { user: null, categories , banData });

    }

  } catch (error) {
    console.log(error.message);
  }

}


// ! User Profile
const userProfile = async (req, res) => {
  try {
    const id = req.session.userId
    const userData = await user.find({ _id: id });
    const addresses = await address.find({ user: id }).sort({ createdDate: -1 }).exec();
    const orderData = await order.find({ user: id })
      .populate('user')
      .populate({
        path: 'address',
        model: 'Address',
      })
      .populate({
        path: 'items.product',
        model: 'Product',
      }).sort({ orderDate: -1 })

    res.render('profile', { user: id, userData, addresses, orderData })
  } catch (error) {
    console.log(error.message);
  }
}


// ! Loading Edit Profile
const loadEditProfile = async (req, res) => {
  try {
    const id = req.session.userId
    const userData = await user.find({ _id: id });
    res.render("profileEdit", { User: userData, user: id });
  } catch (error) {
    console.log(error.message);
  }
};


// ! Edit and pdate Profile
const editProfile = async (req, res) => {
  try {
    const id = req.session.userId;
    const updateData = {}; // Initialize an empty object for updates

    if (req.body.name) {
      updateData.name = req.body.name;
    }
    if (req.body.mobile) {
      updateData.mobile = req.body.mobile;
    }


    await user.findOneAndUpdate({ _id: id }, updateData, { new: true });

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};


// ! User resetting Password
const userResetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.session.userId;

    const secure_password = await securePassword(password);
    const updatedData = await user.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password } });
    res.redirect('/profile')


  } catch (error) {

  }
};



// ! Loading reset password
const loadUserPasswordReset = async (req, res) => {

  try {
    const userid = req.session.userId
    const userData = await user.findById(userid)
    await sendOtpVerification(req, userData.email);
    return res.redirect('/otpVerification');

  } catch (error) {

    console.log(error.message);

  }

};


// ! User Logout
const userLogout = async (req, res) => {
  try {
    delete req.session.userId;

    res.redirect('/')


  } catch (error) {
    console.log(error.message);
  }
};


// ! Loading Wallet page 

const loadWallet = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2; // Adjust the limit based on your preference

    const id = req.session.userId;
    const userData = await user.findById(id);
    
    const totalCount = await Transaction.countDocuments({
      user: userData._id,
      paymentMethod: "Wallet",
    });

    const totalPages = Math.ceil(totalCount / limit);

    const transactions = await Transaction.aggregate([
      { $match: { user: userData._id, description:{$in:['Credited to wallet',`Debited from wallet `]}} },
      { $sort: { date: -1 } },
      
  ]);
  
console.log(transactions)
    res.render("wallet", { User: userData, transactions, user, totalPages, currentPage: page });
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  loadRegister,
  insertUser,
  loadLogin,
  otpControll,
  verifyOtp,
  verifyLogin,
  loadHome,
  userProfile,
  userLogout,
  loadEditProfile,
  editProfile,
  loadUserPasswordReset,
  userResetPassword,
  resendOtp,
  loadWallet

}