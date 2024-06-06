const userCtrl = require('../controllers/user.controller');

const router = require('express').Router();

router.post('/register', userCtrl.register);
router.post('/refreshtoken', userCtrl.refreshtoken);

module.exports = router;
