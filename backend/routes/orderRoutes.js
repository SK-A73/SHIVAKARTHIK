const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Public route for customers to create orders
router.post('/', createOrder);

// Admin protected routes
router.get('/', authMiddleware, getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
