const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offersController');

// Define routes
router.post('/apply_coupon_code', offersController.applyCouponCode);
module.exports = router;
