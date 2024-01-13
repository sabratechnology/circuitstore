const { check, validationResult: expressValidationResult } = require('express-validator');
const Brands = require('../models/Brands');


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
      res.status(200).json({status: 200, code: true, message: 'success', brand_data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];



