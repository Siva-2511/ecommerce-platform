const { query } = require('../config/db');

/**
 * Get or create a cart for the user
 * @param {number} userId 
 */
const getOrCreateCart = async (userId) => {
  let cartResult = await query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);
  
  if (cartResult.rows.length === 0) {
    cartResult = await query(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id',
      [userId]
    );
  }
  
  return cartResult.rows[0].cart_id;
};

/**
 * GET /api/cart
 * Get current user's cart and items
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const cartId = await getOrCreateCart(userId);

    const itemsResult = await query(`
      SELECT ci.item_id, ci.product_id, ci.quantity, 
             p.name, p.price, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.item_id ASC
    `, [cartId]);

    // Calculate subtotal
    const subtotal = itemsResult.rows.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        cart_id: cartId,
        items: itemsResult.rows,
        subtotal: subtotal.toFixed(2)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart/items
 * Add an item to the cart
 */
const addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id || quantity < 1) {
      const err = new Error('Valid product_id and quantity >= 1 are required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    // 1. Verify product exists, is active, and has enough stock
    const productResult = await query(
      'SELECT stock_quantity, is_active FROM products WHERE product_id = $1', 
      [product_id]
    );

    if (productResult.rows.length === 0 || !productResult.rows[0].is_active) {
      const err = new Error('Product not found or inactive');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    if (productResult.rows[0].stock_quantity < quantity) {
      const err = new Error(`Insufficient stock. Only ${productResult.rows[0].stock_quantity} left.`);
      err.statusCode = 400;
      err.code = 'INSUFFICIENT_STOCK';
      return next(err);
    }

    const cartId = await getOrCreateCart(userId);

    // 2. Add or update quantity in cart_items using UPSERT
    const upsertQuery = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id) 
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING *
    `;
    
    await query(upsertQuery, [cartId, product_id, quantity]);
    
    // Update cart updated_at timestamp
    await query('UPDATE carts SET updated_at = NOW() WHERE cart_id = $1', [cartId]);

    // Return the updated cart
    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cart/items/:productId
 * Update item quantity directly
 */
const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      const err = new Error('Quantity must be >= 1');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    const cartId = await getOrCreateCart(userId);

    // Check stock
    const productResult = await query('SELECT stock_quantity FROM products WHERE product_id = $1', [productId]);
    if (productResult.rows.length > 0 && productResult.rows[0].stock_quantity < quantity) {
      const err = new Error(`Insufficient stock. Only ${productResult.rows[0].stock_quantity} left.`);
      err.statusCode = 400;
      err.code = 'INSUFFICIENT_STOCK';
      return next(err);
    }

    const updateResult = await query(`
      UPDATE cart_items 
      SET quantity = $1 
      WHERE cart_id = $2 AND product_id = $3
      RETURNING *
    `, [quantity, cartId, productId]);

    if (updateResult.rows.length === 0) {
      const err = new Error('Item not found in cart');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    await query('UPDATE carts SET updated_at = NOW() WHERE cart_id = $1', [cartId]);

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart
 */
const removeItemFromCart = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const productId = req.params.productId;

    const cartId = await getOrCreateCart(userId);

    const deleteResult = await query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING item_id',
      [cartId, productId]
    );

    if (deleteResult.rows.length === 0) {
      const err = new Error('Item not found in cart');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    await query('UPDATE carts SET updated_at = NOW() WHERE cart_id = $1', [cartId]);

    return getCart(req, res, next);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart
};
