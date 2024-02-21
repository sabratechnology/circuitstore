const db = require('../db');
const Offers = require('../models/Offers');
const { check, validationResult: expressValidationResult } = require('express-validator');


// Validation middleware
const validate = (req, res, next) => {
    const errors = expressValidationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

  exports.applyCouponCode = [
    check('user_id').exists().isInt(),
    check('coupon_code').exists(),
    check('cart_amount').exists().isInt(),
    validate,
    async (req, res) => {
      try {
        const fData = await Offers.applyCouponCode(req.body);
        res.status(200).json({status: true, code: 200, message: 'success',data : fData});
      } catch (error) {
        res.status(500).json({ status: false, code: 500, message : error});
      }
    }];



