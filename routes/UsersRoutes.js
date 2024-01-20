const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Define routes
router.post('/user_cart_data_by_id', usersController.userCartDataById);
router.post('/user_address_details', usersController.userAllAddressDataByUserId);
router.post('/user_profile_details', usersController.userProfileDataByUserId);
router.post('/user_wishlist_details', usersController.userWishlistDataByUserId);




module.exports = router;