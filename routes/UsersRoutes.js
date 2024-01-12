const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Define routes
router.post('/user_cart_data_by_id', usersController.userCartDataById);
router.post('/user_address_details', usersController.userAllAddressDataByUserId);


module.exports = router;
