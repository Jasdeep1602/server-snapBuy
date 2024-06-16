const users = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userCtrl = {
  // register

  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const user = await users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: 'Email already Registered' });
      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: 'Password is atLeast 6 characters' });

      //paassword encryption

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new users({
        name,
        email,
        password: passwordHash,
      });

      //save mongodb

      await newUser.save();

      //create jwt to authenticate

      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });

      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refreshtoken',
      });

      res.json({ accesstoken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // refresh token
  refreshtoken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      console.log(rf_token);
      if (!rf_token) {
        return res.status(400).json({ msg: 'Please Login or Register' });
      }

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: 'Please login or regisrter' });

        const accesstoken = createAccessToken({ id: user.id });
        res.json({ user, accesstoken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },

  // login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await users.findOne({ email });

      if (!user) return res.status(400).json({ msg: 'User does not exist' });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(400).json({ msg: 'Incorrect Password' });

      const accesstoken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });

      res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        path: '/user/refreshtoken',
      });

      res.json({ accesstoken, refreshtoken });
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },

  //logout
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', { path: '/user/refreshtoken' });
      return res.json({ msg: 'logged out' });
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },

  // info user
  getUser: async (req, res) => {
    try {
      const user = await users.findById(req.user.id).select('-password');
      if (!user) return res.status(400).json({ msg: 'User not found' });
      res.json(user);
    } catch {
      return res.status(500).json({ msg: err.msg });
    }
  },
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = userCtrl;
