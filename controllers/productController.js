const { check, validationResult: expressValidationResult } = require('express-validator');
const Product = require('../models/Product');


// Validation middleware
const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


// Controller
exports.productDataById = [
  check('fk_lang_id').exists().isInt(),
  validate,
  async (req, res) => {
    try {
      const fData = await Product.productDataById(req.body);  
      res.status(200).json({status: 200, code: true, message: 'success', data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];



  exports.productData1 = async (req, res) => {
    try {
      const fData = await Product.productData1(req.body);  
      res.status(200).json({ data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  

