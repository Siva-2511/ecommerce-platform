const { query } = require('../config/db');

/**
 * GET /api/products
 * Get paginated, filtered, and searched products
 */
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    const category_id = req.query.category_id;
    const search = req.query.search;
    
    let baseQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = true
    `;
    const queryParams = [];
    let paramIndex = 1;

    if (category_id) {
      baseQuery += ` AND p.category_id = $${paramIndex}`;
      queryParams.push(category_id);
      paramIndex++;
    }

    if (search) {
      baseQuery += ` AND p.name ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as total`;
    const countResult = await query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].count);

    // Add pagination and sorting
    baseQuery += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await query(baseQuery, queryParams);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 * Get single product details
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = $1 AND p.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      const err = new Error('Product not found');
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

/**
 * POST /api/products (Admin Only)
 * Create a new product
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category_id, price, image_url, stock_quantity } = req.body;
    
    // Basic validation
    if (!name || !price) {
      const err = new Error('Name and price are required');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    const insertQuery = `
      INSERT INTO products (name, description, category_id, price, image_url, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, description, category_id || null, price, image_url || null, stock_quantity || 0];
    
    const result = await query(insertQuery, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/products/:id (Admin Only)
 * Update an existing product
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, price, image_url, stock_quantity, is_active } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
    if (category_id !== undefined) { updates.push(`category_id = $${paramIndex++}`); values.push(category_id); }
    if (price !== undefined) { updates.push(`price = $${paramIndex++}`); values.push(price); }
    if (image_url !== undefined) { updates.push(`image_url = $${paramIndex++}`); values.push(image_url); }
    if (stock_quantity !== undefined) { updates.push(`stock_quantity = $${paramIndex++}`); values.push(stock_quantity); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramIndex++}`); values.push(is_active); }

    if (updates.length === 0) {
      const err = new Error('No fields to update');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    values.push(id);
    const updateQuery = `
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE product_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      const err = new Error('Product not found');
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

/**
 * DELETE /api/products/:id (Admin Only)
 * Soft delete a product
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE products SET is_active = false WHERE product_id = $1 RETURNING product_id', 
      [id]
    );

    if (result.rows.length === 0) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      return next(err);
    }

    res.status(200).json({
      success: true,
      message: 'Product soft-deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
