const router = require('express').Router();
const productCtrl = require('../controllers/product.controller');

const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
router
  .route('/products')
  .get(productCtrl.getProducts)
  .post(auth, authAdmin, productCtrl.createProducts);

router
  .route('/products/:id')
  .get(auth, authAdmin, productCtrl.getProductById)
  .delete(auth, authAdmin, productCtrl.deleteProduct)
  .put(auth, authAdmin, productCtrl.updateProduct);

module.exports = router;
