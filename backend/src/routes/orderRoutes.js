const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All order routes require a logged-in user
router.use(authenticateToken);

// Customer routes
router.get('/', orderController.getMyOrders);

// Admin routes
router.get('/admin', requireAdmin, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

module.exports = router;
