const { check, validationResult: expressValidationResult } = require('express-validator');
const Contact = require('../models/Contact');



// Validation middleware
const validate = (req, res, next) => {
  const errors = expressValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


// Controller
exports.contactUsData = [
  check('user_id').isInt(),
  check('name').exists(),
  check('email').exists().isEmail(),
  check('message').exists(),
  validate,
  async (req, res) => {
    try {
      const fData = await Contact.addContactData(req.body);
      const meassge_en = fData.message; 
      const meassge_ar = "تم إرسال الاستفسار بنجاح. سوف نعود اليك قريبا.";  
      res.status(200).json({status: 200, code: true, message: 'success', meassge_en,meassge_ar});
    } catch (error) {
      const meassge_en = "Failed to send enquiry. Please try again later."; 
      const meassge_ar = "فشل في إرسال الاستفسار. الرجاء معاودة المحاولة في وقت لاحق.";  
      console.error('Error:', error);
      res.status(500).json({ status: 500, code: false,meassge_en,meassge_ar,error: error.message });
    }
  }];


  