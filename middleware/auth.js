const user = require('../model/userModel');

const isLogin = async (req, res, next) => {
  try {
    if (req.session.userId) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const isLogout = async (req, res, next) => {
  try {
    if (req.session.userId) {
      res.redirect("/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};


const isBlocked = async (req, res, next) => {
  try {
    const userId = req.session.userId;
   
    const userData = await user.findById(userId).exec();
   
    if(!userData){
      return res.redirect('/login')
    }
    if (userData.is_blocked === 1) {
      
      delete req.session.userId;
      return res.redirect("/login?isBlocked=true");
    }

    
    next();
  } catch (error) {
    console.error('Error in isBlocked middleware:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  isLogin,
  isLogout,
  isBlocked
};
