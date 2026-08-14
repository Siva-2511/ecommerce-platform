const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * GET /health
 * Nginx health check endpoint. Ensures DB is reachable.
 */
router.get('/health', async (req, res, next) => {
  try {
    // Simple query to verify DB connection is alive
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (err) {
    // If DB is unreachable, return 503 Service Unavailable
    // Nginx will see this and mark the instance as down
    console.error('[Health Check Failed]', err.message);
    res.status(503).json({ status: 'ERROR', message: 'Database unreachable' });
  }
});

/**
 * GET /api/instance
 * Demonstration endpoint to prove load balancing.
 * Returns the INSTANCE_ID environment variable.
 */
router.get('/api/instance', (req, res) => {
  res.json({
    instance: process.env.INSTANCE_ID || 'unknown-instance',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
