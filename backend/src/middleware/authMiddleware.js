const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token is missing.',
        timestamp: new Date().toISOString()
      }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access token is invalid or expired.',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Attach user payload (user_id, role, etc.) to request
    req.user = user;
    next();
  });
};

/**
 * Middleware to require admin privileges.
 * Must be used AFTER authenticateToken.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin privileges required.',
        timestamp: new Date().toISOString()
      }
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
