const { query } = require('../config/db');

/**
 * GET /api/orders
 * Get current user's order history
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Get orders with payment status
    const ordersResult = await query(`
      SELECT o.order_id, o.status, o.total_amount, o.shipping_address, o.created_at,
             p.status as payment_status, p.transaction_id, p.failure_reason
      FROM orders o
      LEFT JOIN payments p ON o.order_id = p.order_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [userId]);

    const orders = ordersResult.rows;

    // Fetch items for each order
    for (let order of orders) {
      const itemsResult = await query(`
        SELECT item_id, product_id, product_name, product_price, quantity
        FROM order_items
        WHERE order_id = $1
      `, [order.order_id]);
      
      order.items = itemsResult.rows;
    }

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/admin (Admin Only)
 * Get all platform orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const ordersResult = await query(`
      SELECT o.order_id, o.status, o.total_amount, o.shipping_address, o.created_at,
             u.email, u.first_name, u.last_name,
             p.status as payment_status
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN payments p ON o.order_id = p.order_id
      ORDER BY o.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: ordersResult.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/orders/:id/status (Admin Only)
 * Update order status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    const result = await query(`
      UPDATE orders 
      SET status = $1 
      WHERE order_id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
