const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All payment routes require a logged-in user
router.use(authenticateToken);

router.post('/simulate', checkoutController.simulatePayment);

module.exports = router;
