/**
 * Local Development Server (Emulates Vercel Serverless & Static Routing)
 * Run with: npm run dev or node server.js
 */

require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');

const authHandler = require('./api/auth');
const trackHandler = require('./api/track');
const statsHandler = require('./api/stats');
const recentHandler = require('./api/recent');
const exportHandler = require('./api/export');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. API Routes
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/auth') return authHandler(req, res);
    if (pathname === '/api/track') return trackHandler(req, res);
    if (pathname === '/api/stats') return statsHandler(req, res);
    if (pathname === '/api/recent') return recentHandler(req, res);
    if (pathname === '/api/export') return exportHandler(req, res);

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }

  // 2. Admin Route rewrite (/admin and /admin/ -> admin/index.html)
  if (pathname === '/admin' || pathname === '/admin/') {
    const adminPath = path.join(ROOT_DIR, 'admin', 'index.html');
    return serveFile(res, adminPath, '.html');
  }

  if (pathname.startsWith('/admin/')) {
    const relativeSubPath = pathname.replace(/^\/admin\//, '');
    const candidatePath = path.join(ROOT_DIR, 'admin', relativeSubPath);
    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      return serveFile(res, candidatePath, path.extname(candidatePath));
    }
  }

  // 3. Static Files from root
  let targetPath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    targetPath = path.join(targetPath, 'index.html');
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    return serveFile(res, targetPath, path.extname(targetPath));
  }

  // Fallback 404
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
});

function serveFile(res, filePath, ext) {
  const contentType = MIME_TYPES[ext.toLowerCase()] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);

  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    res.statusCode = 500;
    res.end('Internal Server Error: ' + err.message);
  });
  stream.pipe(res);
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`Arjun Balpande Portfolio & Admin Server running!`);
  console.log(`- Public Portfolio: http://localhost:${PORT}`);
  console.log(`- Admin Dashboard:  http://localhost:${PORT}/admin`);
  console.log(`======================================================\n`);
});
