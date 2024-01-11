const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Define routes
router.post('/home_page_data', homeController.getHomePageData);
module.exports = router;
