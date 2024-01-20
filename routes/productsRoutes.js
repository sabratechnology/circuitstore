const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define routes
router.post('/product_data_by_id', productController.productDataById);
router.post('/product_data_by_category_id', productController.productDataByCatId);
router.post('/product_data_by_subcategory_id', productController.productDataBySubCatId);
router.post('/product_data_by_brand_id', productController.productDataByBrandId);
router.post('/product_data_for_search_bar', productController.productDataForSearchBar);



module.exports = router;
