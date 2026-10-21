/**
 * Server-side Authentication & Session Security Module
 * Issues secure HTTP-only cookies, performs rate-limiting, and guards admin endpoints.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const COOKIE_NAME = 'portfolio_admin_session';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_portfolio_key_change_in_prod';
const TOKEN_EXPIRY = '24h';

// Rate Limiting Storage
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Get Client IP Address from request
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Check if IP is currently rate-limited
 */
function checkRateLimit(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `Too many failed login attempts. Account locked. Please try again in ${remainingMinutes} minute(s).`
    };
  }

  // Reset if lockout expired
  if (record.lockedUntil && record.lockedUntil <= now) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Record a failed attempt
 */
function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
  loginAttempts.set(ip, record);
}

/**
 * Clear attempts on successful login
 */
function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

/**
 * Verify given password against environment configuration
 */
function verifyPassword(password) {
  if (!password || typeof password !== 'string') return false;

  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPassword = process.env.ADMIN_PASSWORD || 'Arjun@@@@!!06';

  if (adminHash) {
    try {
      return bcrypt.compareSync(password, adminHash);
    } catch (e) {
      console.error('Bcrypt comparison error:', e.message);
    }
  }

  if (adminPassword) {
    // Constant-time buffer comparison to prevent timing attacks
    const bufA = Buffer.from(password);
    const bufB = Buffer.from(adminPassword);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  return false;
}

/**
 * Create a signed JWT session token
 */
function createSessionToken() {
  return jwt.sign(
    {
      sub: 'admin',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Serialize Session Cookie
 */
function createSessionCookie(token) {
  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  return cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  });
}

/**
 * Serialize Expired Cookie to Logout
 */
function createLogoutCookie() {
  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  return cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}

/**
 * Verify admin session from request
 */
function verifySession(req) {
  try {
    const rawCookies = req.headers.cookie;
    if (!rawCookies) return null;

    const parsedCookies = cookie.parse(rawCookies);
    const token = parsedCookies[COOKIE_NAME];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Middleware/Guard for Protected API Routes
 */
function requireAdminAuth(req, res) {
  const session = verifySession(req);
  if (!session) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 401;
    res.end(JSON.stringify({
      error: 'Unauthorized',
      message: 'Authentication required to access admin analytics.'
    }));
    return false;
  }
  return true;
}

module.exports = {
  COOKIE_NAME,
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
  clearLoginAttempts,
  verifyPassword,
  createSessionToken,
  createSessionCookie,
  createLogoutCookie,
  verifySession,
  requireAdminAuth
};
