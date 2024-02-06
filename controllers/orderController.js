const { check, validationResult: expressValidationResult } = require('express-validator');
const Orders = require('../models/Orders');


// Validation middleware
const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


// Controller
exports.orderDetailsByOrderId = [
  check('fk_lang_id').exists().isInt(),
  check('order_id').exists().isString(),
  check('user_id').exists().isInt(),
  validate,
  async (req, res) => {
    try {
      const fData = await Orders.orderInfoByOrderId(req.body);  
      res.status(200).json({status: true, code: 200, message: 'success', data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: false, code: 500, message: 'failure',error: error.message });
    }
  }];



  exports.orderHistoryByUserId = [
    check('fk_lang_id').exists().isInt(),
    check('user_id').exists().isInt(),
    validate,
    async (req, res) => {
    try {
      const fData = await Orders.orderHistoriesByUserId(req.body);  
      res.status(200).json({status: true, code: 200, message: 'success', order_history: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: false, code: 500, message: 'failure',error: error.message });
    }
  }];
  

