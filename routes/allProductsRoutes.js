const express = require('express');
const router = express.Router();
const allProductsController = require('../controllers/allProductsController');

// Define routes
router.post('/all_products_data', allProductsController.AllProductsData);
router.post('/search_products_data', allProductsController.SearchProductsData);

module.exports = router;
