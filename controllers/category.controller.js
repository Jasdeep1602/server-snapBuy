const category = require('../models/category.model');
const categoryCtrl = {
  //get category
  getCategories: async (req, res) => {
    try {
      const categories = await category.find();
      res.json(categories);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //create category

  createCategory: async (req, res) => {
    try {
      const { name } = req.body;
      const Category = await category.findOne({ name });
      if (Category)
        return res.status(400).json({ msg: 'Category Already Exists' });
      const newCategory = new category({ name });
      newCategory.save();
      res.json({ msg: 'Created a Category' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  //delete category

  deleteCategory: async (req, res) => {
    try {
      await category.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Category deleted' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //update
  updateCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await category.findByIdAndUpdate({ _id: req.params.id }, { name });
      res.json({ msg: 'Category updated' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = categoryCtrl;
