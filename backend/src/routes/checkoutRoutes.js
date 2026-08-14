const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All checkout routes require a logged-in user
router.use(authenticateToken);

router.post('/', checkoutController.checkout);

// Note: In PRD Section 15, payment simulation is under /api/payments/simulate, 
// but we'll mount it here for simplicity, or we can mount it correctly in server.js
// We'll export the controller method and let server.js handle the mount point.

module.exports = router;
