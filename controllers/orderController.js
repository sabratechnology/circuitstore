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




  exports.placedOrderDetailsByOrderId = [
    check('fk_lang_id').exists().isInt(),
    check('order_id').exists().isString(),
    check('user_id').exists().isInt(),
    validate,
    async (req, res) => {
      try {
        const fData = await Orders.placedOrderInfoByOrderId(req.body);  
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



  exports.addOrderPayments = [
    check('user_id').exists().isInt(),
    check('fk_product_id').exists().isInt(),
    check('fk_address_id').exists().isInt(),
    check('quantity').exists().isNumeric(),
    check('unit_price').exists().isNumeric(),
    check('total').exists().isNumeric(),
    check('sub_total').exists().isNumeric(),
    check('tax').exists().isNumeric(),
    check('grand_total').exists().isNumeric(),  
    check('order_source').exists().isNumeric(),   
 
    validate,
    async (req, res) => {
      
    try {
      const fData = await Orders.addOrderPaymentsInfo(req.body);  
      res.status(200).json({status: true, code: 200, message: 'success', order_status: fData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: false, code: 500, message: 'failure',error: error.message });
    }
  }];


  exports.placeOrders = [

    check('payment_type').exists().isNumeric(),
    check('order_id').exists(),
    check('order_no').exists().isNumeric(),
    check('user_id').exists().isInt(),
    check('fk_product_id').exists().isInt(),
    check('fk_address_id').exists().isInt(),
    check('quantity').exists().isNumeric(),
    check('unit_price').exists().isNumeric(),
    check('total').exists().isNumeric(),
    check('sub_total').exists().isNumeric(),
    check('tax').exists().isNumeric(),
    check('grand_total').exists().isNumeric(),  
    check('order_source').exists().isNumeric(), 
    validate,
    async (req, res) => {
      
    try {
      const fData = await Orders.placeOrderRequest(req.body);  
      res.status(200).json({status: true, code: 200, message: 'success', order_status: 'Your order has been successfully placed.' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: false, code: 500, message: 'failure',error: error.message });
    }
  }];


  
  

