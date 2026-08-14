const { getClient, query } = require('../config/db');
const cartController = require('./cartController');

/**
 * POST /api/checkout
 * Create an order from the current cart using an atomic transaction
 */
const checkout = async (req, res, next) => {
  const client = await getClient();
  
  try {
    const userId = req.user.user_id;
    const { shipping_address } = req.body;

    if (!shipping_address) {
      const err = new Error('Shipping address is required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    await client.query('BEGIN'); // Start transaction

    // 1. Get user's cart id
    const cartResult = await client.query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      throw new Error('Cart not found');
    }
    const cartId = cartResult.rows[0].cart_id;

    // 2. Fetch cart items with row-level locks on products (FOR UPDATE)
    // This prevents race conditions where multiple users buy the last item simultaneously (RSK-07)
    const itemsResult = await client.query(`
      SELECT ci.quantity, p.product_id, p.name, p.price, p.stock_quantity 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1
      FOR UPDATE OF p
    `, [cartId]);

    const items = itemsResult.rows;

    if (items.length === 0) {
      const err = new Error('Cart is empty');
      err.statusCode = 400;
      err.code = 'EMPTY_CART';
      throw err;
    }

    let totalAmount = 0;

    // 3. Verify stock and calculate total
    for (const item of items) {
      if (item.stock_quantity < item.quantity) {
        const err = new Error(`Insufficient stock for ${item.name}. Only ${item.stock_quantity} left.`);
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_STOCK';
        throw err;
      }
      totalAmount += parseFloat(item.price) * item.quantity;
    }

    // 4. Create Order
    const orderResult = await client.query(`
      INSERT INTO orders (user_id, status, total_amount, shipping_address)
      VALUES ($1, 'PENDING', $2, $3)
      RETURNING order_id, status, total_amount
    `, [userId, totalAmount, shipping_address]);
    
    const order = orderResult.rows[0];

    // 5. Insert Order Items and Deduct Stock
    for (const item of items) {
      // Insert order item
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
        VALUES ($1, $2, $3, $4, $5)
      `, [order.order_id, item.product_id, item.name, item.price, item.quantity]);

      // Deduct stock
      await client.query(`
        UPDATE products 
        SET stock_quantity = stock_quantity - $1 
        WHERE product_id = $2
      `, [item.quantity, item.product_id]);
    }

    // 6. Clear cart items (but keep the cart itself)
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    await client.query('UPDATE carts SET updated_at = NOW() WHERE cart_id = $1', [cartId]);

    // 7. Initialize Payment record
    await client.query(`
      INSERT INTO payments (order_id, status)
      VALUES ($1, 'PENDING')
    `, [order.order_id]);

    await client.query('COMMIT'); // Commit transaction

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Pending payment.',
      order
    });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on any failure
    next(err);
  } finally {
    client.release(); // Always release the client back to the pool
  }
};

/**
 * POST /api/payments/simulate
 * Simulates a payment gateway response (90% success, 10% failure)
 */
const simulatePayment = async (req, res, next) => {
  const client = await getClient();
  
  try {
    const userId = req.user.user_id;
    const { order_id } = req.body;

    if (!order_id) {
      const err = new Error('order_id is required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    await client.query('BEGIN');

    // 1. Verify order belongs to user and is PENDING
    const orderResult = await client.query('SELECT status FROM orders WHERE order_id = $1 AND user_id = $2 FOR UPDATE', [order_id, userId]);
    
    if (orderResult.rows.length === 0) {
      const err = new Error('Order not found or does not belong to you');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (orderResult.rows[0].status !== 'PENDING') {
      const err = new Error(`Order cannot be paid. Current status: ${orderResult.rows[0].status}`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS';
      throw err;
    }

    // 2. Simulate Payment Logic
    // 90% chance of success
    const isSuccess = Math.random() < 0.90;
    const transactionId = `sim_txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (isSuccess) {
      // 3a. Payment Success
      await client.query('UPDATE orders SET status = $1 WHERE order_id = $2', ['PAID', order_id]);
      await client.query('UPDATE payments SET status = $1, transaction_id = $2 WHERE order_id = $3', ['SUCCESS', transactionId, order_id]);
      
      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        transaction_id: transactionId,
        order_status: 'PAID'
      });
    } else {
      // 3b. Payment Failed -> Cancel Order and Restore Stock
      const reason = 'Insufficient funds (Simulated)';
      
      await client.query('UPDATE orders SET status = $1 WHERE order_id = $2', ['CANCELLED', order_id]);
      await client.query('UPDATE payments SET status = $1, failure_reason = $2 WHERE order_id = $3', ['FAILED', reason, order_id]);
      
      // Restore stock for all items in the cancelled order
      const itemsResult = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [order_id]);
      for (const item of itemsResult.rows) {
        await client.query('UPDATE products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2', [item.quantity, item.product_id]);
      }

      await client.query('COMMIT');

      res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_FAILED',
          message: `Payment failed: ${reason}. Order has been cancelled and stock restored.`,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  checkout,
  simulatePayment
};
