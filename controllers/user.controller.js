const users = require('../models/user.model');
const products = require('../models/product.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Stripe = require('stripe');
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

      // const accesstoken = createAccessToken({ id: newUser._id });
      // const refreshtoken = createRefreshToken({ id: newUser._id });

      // res.cookie('refreshtoken', refreshtoken, {
      //   httpOnly: true,
      //   path: '/user/refreshtoken',
      // });

      res.json({ msg: 'Account Created ' });
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

  addItemToCart: async (req, res) => {
    try {
      const {
        _id,
        product_id,
        title,
        price,
        description,
        images,
        gradientFrom,
        gradientTo,
        shadowColor,
        quantity,
      } = req.body;
      const userId = req.user.id;

      // Check if the product exists
      const product = await products.findById(_id);
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      // Find the user and update the cart
      const user = await users.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if the product is already in the cart
      const cartItem = user.cart.find(
        (item) => item._id.toString() === _id.toString()
      );
      if (cartItem) {
        // If exists, update quantity
        cartItem.quantity += quantity;
      } else {
        // If not exists, add new item to cart
        user.cart.push({
          _id,
          product_id,
          title,
          price,
          description,
          images,
          gradientFrom,
          gradientTo,
          shadowColor,
          quantity,
        });
      }

      // Mark the modified paths to ensure Mongoose updates them
      user.markModified('cart');

      // Save the updated user object
      await user.save();

      res.json({ msg: 'Item added to cart', user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Remove item from cart
  removeItemFromCart: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Find the user and update the cart
      const user = await users.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Filter out the product from cart
      user.cart = user.cart.filter((item) => item._id.toString() !== id);

      // Save the updated user object
      await user.save();

      res.json({ msg: 'Item removed from cart', user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Increase quantity of item in cart
  increaseQuantity: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Find the user and update the cart
      const user = await users.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Find the item in cart and increase quantity
      const cartItem = user.cart.find((item) => item._id.toString() === id);
      if (cartItem) {
        cartItem.quantity++;
      } else {
        return res.status(404).json({ msg: 'Item not found in cart' });
      }

      // Mark the modified paths to ensure Mongoose updates them
      user.markModified('cart');

      // Save the updated user object
      await user.save();

      res.json({ msg: 'Quantity increased', user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Decrease quantity of item in cart
  decreaseQuantity: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Find the user and update the cart
      const user = await users.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Find the item in cart and decrease quantity
      const cartItem = user.cart.find((item) => item._id.toString() === id);
      if (cartItem) {
        cartItem.quantity--;
        if (cartItem.quantity <= 0) {
          // Remove item from cart if quantity is zero or less
          user.cart = user.cart.filter((item) => item._id.toString() !== id);
        }
      } else {
        return res.status(404).json({ msg: 'Item not found in cart' });
      }

      // Mark the modified paths to ensure Mongoose updates them
      user.markModified('cart');

      // Save the updated user object
      await user.save();

      res.json({ msg: 'Quantity decreased', user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Empty the cart
  emptyCart: async (req, res) => {
    try {
      const userId = req.user.id;

      // Find the user
      const user = await users.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Set the cart to an empty array
      user.cart = [];

      // Save the updated user object
      await user.save();

      res.json({ msg: 'Cart emptied', user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // payment gateway

  checkoutSession: async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      // Find the user
      const user = await users.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // create stripe checkour session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${process.env.CLIENT_SITE_URL}/checkout-success`,
        cancel_url: `${process.env.CLIENT_SITE_URL}/checkout-failed`,
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'SubTotal:',
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
      });
      res.status(200).json({ session, msg: 'Payment Successfull' });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
