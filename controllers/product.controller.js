const { query } = require('express');

const products = require('../models/product.model');

//Filter,sorting and pagination

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const queryObj = { ...this.queryString };

    const excluededFields = ['page', 'sort', 'limit'];
    excluededFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => '$' + match
    );

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join('');

      this.query = this.query.sort(sortBy);

      console.log(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;

    const limit = this.queryString.limit * 1 || 9;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(products.find(), req.query)
        .filtering()
        .sorting()
        .pagination();
      const product = await features.query;
      res.json({
        status: 'success',
        result: product.length,
        products: product,
      });
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
        rating,
        images,
        gradientFrom,
        gradientTo,
        shadowColor,
      } = req.body;

      if (!images) return res.status(400).json({ msg: 'No Image Uploaded' });
      const product = await products.findOne({ product_id });
      if (product)
        return res.status(400).json({ msg: 'Product already exists' });

      const newProduct = new products({
        product_id,
        title,
        price,
        description,
        images,
        gradientFrom,
        gradientTo,
        shadowColor,
        rating,
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
        images,
        gradientFrom,
        gradientTo,
        shadowColor,
        rating,
      } = req.body;

      if (!images) return res.status(500).json({ msg: 'no image Uploaded' });
      await products.findOneAndUpdate(
        { _id: req.params.id },
        {
          title,
          price,
          description,
          images,
          gradientFrom,
          gradientTo,
          shadowColor,
          rating,
        }
      );
      res.json({ msg: 'Updated a Product' });
    } catch (err) {
      return res.status(500).json({ msg: err.msg });
    }
  },
};

module.exports = productCtrl;
