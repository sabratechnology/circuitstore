const { check, validationResult: expressValidationResult } = require('express-validator');
const Latest = require('../models/Latest');

const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Controller
exports.latestData = [
  check('fk_lang_id').exists().isInt(),
  check('page').exists().isInt(),
  check('pageSize').exists().isInt(),
  validate, 
  async (req, res) => {
    try {
      const fData = await Latest.latestData(req.body);  
      res.status(200).json({ status: true, code: 200, message: 'success', data: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: false, code: 500, message: 'failure', error: error.message });
    }
  }
];
  

