const { check, validationResult: expressValidationResult } = require('express-validator');
const Featured = require('../models/Featured');
const OrderByInfo = require('../models/common/CommonModel');


const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Controller
exports.featuredData = [
  check('fk_lang_id').exists().isInt(),
  check('page').exists().isInt(),
  check('pageSize').exists().isInt(),
  validate, 
  async (req, res) => {
    try {

      const OrderBy = await OrderByInfo.getOrderByASC('featured'); 
      req.body.order_by_featured = OrderBy;
      const fData = await Featured.featuredData(req.body);  
      res.status(200).json({status: true, code: 200, message: 'success', data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: false, code: 500, message: 'failure',error: error.message });
    }
  }
];
  

