const users = require('../models/userModel');

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      console.log(req.body, name, email, password, 'bbh');

      const user = await users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: 'Email already Registered' });
      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: 'Password is atLeast 6 characters' });

      const newUser = new users({
        name,
        email,
        password,
      });
      //save mongodb
      await newUser.save();
      res.json({ msg: 'Register Success' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = userCtrl;
