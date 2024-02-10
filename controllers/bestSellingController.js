const { check, validationResult: expressValidationResult } = require('express-validator');
const BestSelling = require('../models/BestSelling');
const OrderByInfo = require('../models/common/CommonModel');


// Validation middleware
const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Controller
exports.BestSellingData = [
  check('fk_lang_id').exists().isInt(),
  check('page').exists().isInt(),
  check('pageSize').exists().isInt(),
  validate,
  async (req, res) => {
    try {
      const orderByBest = await OrderByInfo.getOrderByASC('best'); 
      req.body.order_by_best = orderByBest;
      const fData = await BestSelling.BestSellingData(req.body);  
      res.status(200).json({status: true, code: 200, message: 'success',data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({status: false, code: 500,message: 'failure',error: error.message });
    }
  }
];
  

