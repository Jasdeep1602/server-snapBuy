const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Object,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    gradientFrom: {
      type: String,
      required: true,
    },
    gradientTo: {
      type: String,
      required: true,
    },
    shadowColor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('products', productSchema);
