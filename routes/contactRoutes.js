const express = require('express');
const router = express.Router();
const contactUsController = require('../controllers/contactUsController');

// Define routes
router.post('/contact_us', contactUsController.contactUsData);
module.exports = router;
