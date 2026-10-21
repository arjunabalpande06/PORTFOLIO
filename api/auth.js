/**
 * Vercel Serverless Function: Authentication Controller
 * Handles Admin Login, Session Verification, and Logout
 */

const {
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
  clearLoginAttempts,
  verifyPassword,
  createSessionToken,
  createSessionCookie,
  createLogoutCookie,
  verifySession
} = require('./_auth');

module.exports = async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const ip = getClientIp(req);
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = url.searchParams.get('action') || (req.body && req.body.action);

  // Helper to parse JSON body if not pre-parsed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  } else if (!body && req.method === 'POST') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data || '{}'));
        } catch (e) {
          resolve({});
        }
      });
    });
  }

  // 1. Session Check
  if (action === 'check' || req.method === 'GET') {
    const session = verifySession(req);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      authenticated: !!session,
      user: session ? 'Admin' : null
    }));
  }

  // 2. Logout
  if (action === 'logout') {
    const cookieHeader = createLogoutCookie();
    res.setHeader('Set-Cookie', cookieHeader);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }));
  }

  // 3. Login
  if (action === 'login' || req.method === 'POST') {
    // Check Rate Limiting
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 429;
      return res.end(JSON.stringify({
        error: 'Too Many Requests',
        message: rateCheck.message
      }));
    }

    const password = body?.password;
    if (!password) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 400;
      return res.end(JSON.stringify({
        error: 'Bad Request',
        message: 'Password is required'
      }));
    }

    const isValid = verifyPassword(password);
    if (!isValid) {
      recordFailedAttempt(ip);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 401;
      return res.end(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid administrative credentials.'
      }));
    }

    // Success: Clear attempts, generate token and set cookie
    clearLoginAttempts(ip);
    const token = createSessionToken();
    const cookieHeader = createSessionCookie(token);

    res.setHeader('Set-Cookie', cookieHeader);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      message: 'Authentication successful'
    }));
  }

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 405;
  return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
};
