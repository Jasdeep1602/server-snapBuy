const userCtrl = require('../controllers/user.controller');
const auth = require('../middleware/auth');

const router = require('express').Router();

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/refreshtoken', userCtrl.refreshtoken);

router.get('/infor', auth, userCtrl.getUser);

// New routes for cart operations
router.post('/add-to-cart', auth, userCtrl.addItemToCart);
router.delete('/remove-from-cart/:id', auth, userCtrl.removeItemFromCart);
router.put('/increase-quantity/:id', auth, userCtrl.increaseQuantity);
router.put('/decrease-quantity/:id', auth, userCtrl.decreaseQuantity);
router.put('/emptycart', auth, userCtrl.emptyCart);

module.exports = router;
