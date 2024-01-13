const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Define routes
router.post('/brand_page_data', brandController.brandDetails);
module.exports = router;
