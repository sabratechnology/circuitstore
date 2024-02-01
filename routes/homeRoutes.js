const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Define routes
router.post('/home_page_data', homeController.getHomePageData);
router.post('/common_navbar_data', homeController.getNavBarData);
router.post('/save_seach_keywords', homeController.saveKeywords);



module.exports = router;
