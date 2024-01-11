const express = require('express');
const router = express.Router();
const bestSellingController = require('../controllers/bestSellingController');

// Define routes
router.post('/best_selling_data', bestSellingController.BestSellingData);
module.exports = router;
