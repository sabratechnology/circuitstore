const express = require('express');
const router = express.Router();
const featuredController = require('../controllers/featuredController');

// Define routes
router.post('/featured_page_data', featuredController.featuredData);
module.exports = router;
