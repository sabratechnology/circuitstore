const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Define routes
router.post('/confirm_order_details_by_order_id', orderController.orderDetailsByOrderId);
router.post('/orders_history_by_user_id', orderController.orderHistoryByUserId);
router.post('/add_order_payment_info', orderController.addOrderPayments);


module.exports = router;
