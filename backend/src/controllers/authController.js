const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * POST /api/auth/register
 * Register a new user (customer by default)
 */
const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // 1. Basic validation
    if (!email || !password || !first_name || !last_name) {
      const err = new Error('Missing required fields: email, password, first_name, last_name');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    // 2. Check if user already exists
    const userCheck = await query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      const err = new Error('User with this email already exists.');
      err.statusCode = 409;
      err.code = 'USER_EXISTS';
      return next(err);
    }

    // 3. Hash password (salt rounds = 12 as per PRD Section 6)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insert user into DB
    const insertQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, 'customer')
      RETURNING user_id, email, first_name, last_name, role, created_at
    `;
    const result = await query(insertQuery, [email, passwordHash, first_name, last_name]);
    const newUser = result.rows[0];

    // 5. Return success (without token, require them to log in, or optionally return token here)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Missing email or password');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }

    // 1. Find user by email
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      return next(err);
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      return next(err);
    }

    // 3. Generate JWT (7-day expiry as per PRD Section 6)
    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/profile
 * Get current user profile based on JWT
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is set by authenticateToken middleware
    const userId = req.user.user_id;

    const result = await query(
      'SELECT user_id, email, first_name, last_name, role, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      return next(err);
    }

    res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
