const users = require('../models/user.model');

const authAdmin = async (req, res, next) => {
  try {
    const user = await users.findOne({
      _id: req.user.id,
    });
    if (user.role === 0)
      return res.status(400).json({ msg: 'Admin Resuorces Access Denied' });

    next();
  } catch (err) {
    return res.status(500).json({ msg: err.msg });
  }
};

module.exports = authAdmin;
