const router = require('express').Router();
const productCtrl = require('../controllers/product.controller');
router
  .route('/products')
  .get(productCtrl.getProducts)
  .post(productCtrl.createProducts);

router
  .route('/products/:id')
  .delete(productCtrl.deleteProduct)
  .put(productCtrl.updateProduct);

module.exports = router;
