const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All cart routes require a logged-in user
router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.put('/items/:productId', cartController.updateItemQuantity);
router.delete('/items/:productId', cartController.removeItemFromCart);

module.exports = router;
