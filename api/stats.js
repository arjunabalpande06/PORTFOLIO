/**
 * Vercel Serverless Function: Aggregated Analytics Statistics API
 * Protected: Requires valid HTTP-only admin session cookie.
 */

const { requireAdminAuth } = require('./_auth');
const { getStats } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  // Verify Admin Session
  if (!requireAdminAuth(req, res)) {
    return; // Response already ended with 401 in requireAdminAuth
  }

  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const range = url.searchParams.get('range') || '30d';

  try {
    const stats = await getStats(range);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      range,
      ...stats
    }));
  } catch (err) {
    console.error('Stats error:', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    return res.end(JSON.stringify({
      error: 'Failed to retrieve analytics stats',
      message: err.message
    }));
  }
};
