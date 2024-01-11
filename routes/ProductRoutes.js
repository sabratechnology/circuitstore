const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define routes
router.post('/product_data_by_id', productController.productDataById);
router.post('/product_data1', productController.productData1);

module.exports = router;
