const user = require('../model/userModel'); 

const userMiddleware = {
  blockUser: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      await user.findByIdAndUpdate(userId, { isBlocked: 1 });
      next();
    } catch (error) {
      console.error('Error in blockUser middleware:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  unblockUser: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      await user.findByIdAndUpdate(userId, { isBlocked: 0 });
      next();
    } catch (error) {
      console.error('Error in unblockUser middleware:', error);
      res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = userMiddleware;