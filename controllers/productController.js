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
  check('product_id').exists().isInt(),
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



  exports.productDataByCatId = [
    check('fk_lang_id').exists().isInt(),
    check('category_id').exists().isInt(),
    check('page').exists().isInt(),
    validate,
    async (req, res) => {
    try {
      const fData = await Product.productDataByCategId(req.body);
  
      res.status(200).json({status: 200, code: true, message: 'success', data: fData});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];




  exports.productDataBySubCatId = [
    check('fk_lang_id').exists().isInt(),
    check('category_id').exists().isInt(),
    check('sub_category_id').exists().isInt(),
    check('page').exists().isInt(),
    validate,
    async (req, res) => {
    try {
      const fData = await Product.productDataBySubCategId(req.body);  
      res.status(200).json({status: 200, code: true, message: 'success', data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];


  



  exports.productDataForSearchBar = [
    check('fk_lang_id').exists().isInt(),
    validate,
    async (req, res) => {
    try {
      const fData = await Product.searchBarData(req.body);  
      res.status(200).json({status: 200, code: true, message: 'success', product_data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];
  


  exports.productDataByBrandId = [
    check('fk_lang_id').exists().isInt(),
    check('brand_id').exists().isInt(),
    check('page').exists().isInt(),
    validate,
    async (req, res) => {
    try {
      const fData = await Product.productInfoByBrandId(req.body);  
      res.status(200).json({status: 200, code: true, message: 'success', data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];


  exports.productDataForRelatedSection = [
    check('fk_lang_id').exists().isInt(),
    check('bottom_id').exists().isInt(),
    validate,
    async (req, res) => {
    try {
      const fData = await Product.productInfoByBottomId(req.body);  
      res.status(200).json({status: 200, code: true, message: 'success', data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false, message: 'failure',error: error.message });
    }
  }];



  

