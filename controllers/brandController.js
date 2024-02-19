const { check, validationResult: expressValidationResult } = require('express-validator');
const Brands = require('../models/Brands');
const cartCounts = require('../models/common/CommonModel');


// Validation middleware
const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Controller
exports.brandDetails = [
  check('fk_lang_id').exists().isInt(),
  validate,
  async (req, res) => {
    try {
      const fData = await Brands.getBrandData(req.body);
      const cartCount = req.body.user_id ? await cartCounts.getCartCountByUserId(req.body.user_id) : 0;
      res.status(200).json({status: true, code: 200, message: 'success', brand_data: fData,cart_count: cartCount});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: false, code: 500, message: 'failure',error: error.message });
    }
  }];



