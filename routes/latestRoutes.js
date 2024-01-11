const express = require('express');
const router = express.Router();
const latestController = require('../controllers/latestController');

// Define routes
router.post('/latest_page_data', latestController.latestData);
module.exports = router;
