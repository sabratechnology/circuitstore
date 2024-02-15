const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Define routes

router.post('/user_cart_data_by_id', usersController.userCartDataById);
router.post('/user_address_details', usersController.userAllAddressDataByUserId);
router.post('/user_profile_details', usersController.userProfileDataByUserId);
router.post('/add_wishlist_products', usersController.addProductsInWishlist);
router.post('/delete_wishlist_products', usersController.deleteWishlistProducts);
router.post('/user_wishlist_details', usersController.userWishlistDataByUserId);
router.post('/add_user_address_details', usersController.addUsersAddressInfo);
router.post('/update_user_address_details', usersController.updateUsersAddressById);
router.post('/delete_user_address_details', usersController.deleteUsersAddressById);
router.post('/add_cart_products', usersController.addCartsProducts);
router.post('/update_cart_details', usersController.updateCartsProducts);
router.post('/delete_cart_products', usersController.deleteCartsProducts);
router.post('/delivery_charges_by_address_id', usersController.deliveryCharges);









module.exports = router;
