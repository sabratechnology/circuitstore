const { check, validationResult: expressValidationResult } = require('express-validator');
const Home = require('../models/Home');
const User = require('../models/Users');


// Validation middleware
const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Controller
exports.getHomePageData = [
  check('fk_lang_id').exists().isInt(),
  validate,
  async (req, res) => {
    try {
      const fData = await Home.homePage(req.body);  
      res.status(200).json({status: 200, code: true, message: 'success',data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure', error: error.message });
    }
  }
];


exports.getNavBarData = [
  check('fk_lang_id').exists().isInt(),
  validate,
  async (req, res) => {
    try {
      const fData = await Home.navBarData(req.body); 
      const userCartData = await User.userCartDataByUserId(req.body); 
      const userWishListCount = await Home.getwishlistCount(req.body); 
      const userProfileData = await User.userProfileDataById(req.body);
      const cartData = (userCartData && userCartData.cart_data) ? userCartData.cart_data : [];
      const wishlistCount = userWishListCount && userWishListCount[0] && userWishListCount[0].wishlist_count !== null ? userWishListCount[0].wishlist_count : 0;

      const subTotalCartData = userCartData.sub_total ? userCartData.sub_total : 0;
      const userName = userProfileData && userProfileData.length > 0 ? userProfileData[0].user_name : '';
      const cartCount = cartData.length;

      res.status(200).json({status: 200, code: true, message: 'success',cat_data:fData,cart_data:cartData,sub_total:subTotalCartData,cart_count:cartCount,wishlist_count:wishlistCount,user_profile_data:userName});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure', error: error.message });
    }
  }
];



exports.saveKeywords = [
  check('fk_lang_id').exists().isInt(),
  check('keywords').exists(),
  validate,
  async (req, res) => {
    try {
      const fData = await Home.saveSearchBarData(req.body); 
      res.status(200).json({status: 200, code: true, message: 'data successfully saved'});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure', error: error.message });
    }
  }
];


