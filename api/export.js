/**
 * Vercel Serverless Function: Export Analytics Data API
 * Protected: Requires valid HTTP-only admin session cookie.
 */

const { requireAdminAuth } = require('./_auth');
const { exportEvents } = require('./_db');

module.exports = async function handler(req, res) {
  if (!requireAdminAuth(req, res)) {
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const format = url.searchParams.get('format') || 'json';
  const filterRange = url.searchParams.get('range') || 'all';

  try {
    const data = await exportEvents({ format, filterRange });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="portfolio-analytics-${new Date().toISOString().split('T')[0]}.csv"`);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="portfolio-analytics-${new Date().toISOString().split('T')[0]}.json"`);
    }

    res.statusCode = 200;
    return res.end(data);
  } catch (err) {
    console.error('Export error:', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Export failed', message: err.message }));
  }
};
