const { check, validationResult: expressValidationResult } = require('express-validator');
const Users = require('../models/Users');
const Home = require('../models/Home');



// Validation middleware
const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


// Controller
exports.userCartDataById = [
  check('fk_lang_id').exists().isInt(),
  check('user_id').exists().isInt(),
  validate,
  async (req, res) => {
    try {
      const fData = await Users.userCartDataByUserId(req.body);  
      
      res.status(200).json({status: 200, code: true, message: 'success', data: fData});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];


  exports.userAllAddressDataByUserId = [
    check('fk_lang_id').exists().isInt(),
    check('user_id').exists().isInt(),
    validate,
    async (req, res) => {
      try {
        const fData = await Users.userAddressDataById(req.body);  
        res.status(200).json({status: 200, code: true, message: 'success', data: fData });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
      }
    }];

    exports.userProfileDataByUserId = [
      check('fk_lang_id').exists().isInt(),
      check('user_id').exists().isInt(),
      validate,
      async (req, res) => {
        try {
          const fData = await Users.userProfileDataById(req.body);  
          const cartCount = await Home.getuserCartCount(req.body);
          const wishlistCount = await Home.getwishlistCount(req.body); 
          const cartCountValue = cartCount && cartCount[0] && cartCount[0].cart_count != null ? cartCount[0].cart_count : 0;
          const wishlistCountValue = wishlistCount && wishlistCount[0] && wishlistCount[0].wishlist_count != null ? wishlistCount[0].wishlist_count : 0;

          res.status(200).json({status: 200, code: true, message: 'success', user_profile: fData,cart_count:cartCountValue,wishlist_count:wishlistCountValue });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
        }
      }];
    

      exports.userWishlistDataByUserId = [
        check('fk_lang_id').exists().isInt(),
        check('user_id').exists().isInt(),
        validate,
        async (req, res) => {
          try {
            const fData = await Users.userWishListDataById(req.body);  
            const cartCount = await Home.getuserCartCount(req.body);
            const cartCountValue = cartCount && cartCount[0] && cartCount[0].cart_count != null ? cartCount[0].cart_count : 0;
  
            res.status(200).json({status: 200, code: true, message: 'success', wishlist_data: fData,cart_count:cartCountValue});
          } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
          }
        }];




        exports.updateUsersAddressById = [
          check('fk_lang_id').exists().isInt(),
          check('user_id').exists().isInt(),
          check('id').exists().isInt(),
          check('roomno').exists(),
          check('building').exists(),
          check('street').exists(),
          check('zone').exists(),
          check('latitude').exists(),
          check('longitude').exists(),
          validate,
          async (req, res) => {
            try {
              const fData = await Users.updateUserAddressDataById(req.body);  
              const message_en = fData.message;
              const message_ar = "تم تحديث العنوان بنجاح ";
              res.status(200).json({status: 200, code: true,message_en,message_ar});
            } catch (error) {
              const message_en = 'Unable to update delivery address';
              const message_ar = "غير قادر على تحديث عنوان التسليم";
              res.status(500).json({ status: 500, code: false, message_en,message_ar, error: error.message });
            }
          }];
