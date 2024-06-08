const products = require('../models/product.model');
const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const product = await products.find();
      res.json(product);
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },

  createProducts: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
      } = req.body;

      if (!images) return res.status(400).json({ msg: 'No Image Uploaded' });
      const product = await products.findOne({ product_id });
      if (product)
        return res.status(400).json({ msg: 'Product already exists' });

      const newProduct = new products({
        product_id,
        title: title.toLowerCase(),
        price,
        description,
        content,
        images,
        category,
      });
      await newProduct.save();
      res.json({ msg: 'Created' });
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await products.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Deleted a Product' });
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
      } = req.body;

      if (!images) return res.status(500).json({ msg: 'no image Uploaded' });
      await products.findOneAndUpdate(
        { _id: req.params.id },
        {
          title: title.toLowerCase(),
          price,
          description,
          content,
          images,
          category,
        }
      );
      res.json({ msg: 'Updated a Product' });
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },
};

module.exports = productCtrl;
