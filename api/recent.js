/**
 * Vercel Serverless Function: Paginated Recent Visitor Logs API
 * Protected: Requires valid HTTP-only admin session cookie.
 */

const { requireAdminAuth } = require('./_auth');
const { getRecentEvents } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  // Verify Admin Session
  if (!requireAdminAuth(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const search = url.searchParams.get('search') || '';
  const filterRange = url.searchParams.get('range') || 'all';
  const eventType = url.searchParams.get('eventType') || 'all';

  try {
    const data = await getRecentEvents({
      page,
      limit,
      search,
      filterRange,
      eventType
    });

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      ...data
    }));
  } catch (err) {
    console.error('Recent events error:', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    return res.end(JSON.stringify({
      error: 'Failed to retrieve visitor records',
      message: err.message
    }));
  }
};
