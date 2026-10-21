/**
 * Vercel Serverless Function: Visitor Telemetry Ingestion Endpoint
 * Collects non-intrusive, privacy-conscious page views and engagement events.
 */

const crypto = require('crypto');
const { saveEvent } = require('./_db');

const SALT = process.env.ANALYTICS_SALT || 'portfolio_arjun_privacy_salt_2026';

/**
 * Parse User Agent into structured device, browser, and OS
 */
function parseUserAgent(ua = '') {
  ua = ua.toLowerCase();
  let device = 'desktop';
  let browser = 'Other';
  let os = 'Other';

  // Device detection
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    device = 'mobile';
  }

  // OS detection
  if (ua.includes('win')) os = 'Windows';
  else if (ua.includes('mac') && !ua.includes('iphone') && !ua.includes('ipad')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'iOS';

  // Browser detection
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/') && !ua.includes('chromium')) browser = 'Chrome';
  else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox/')) browser = 'Firefox';
  else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';

  return { device, browser, os };
}

/**
 * Extract domain cleanly from referrer
 */
function extractReferrerDomain(referrer) {
  if (!referrer) return 'Direct / None';
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'Other';
  }
}

/**
 * HMAC Hash for privacy-preserving visitor identifier
 */
function anonymizeVisitorId(rawId) {
  if (!rawId) rawId = crypto.randomBytes(16).toString('hex');
  return crypto.createHmac('sha256', SALT).update(rawId).digest('hex').substring(0, 32);
}

module.exports = async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // Parse Body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  } else if (!body) {
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

  const userAgent = req.headers['user-agent'] || '';
  const { device: parsedDevice, browser, os } = parseUserAgent(userAgent);

  // Vercel Geolocation headers
  const country = req.headers['x-vercel-ip-country'] || 'Direct';
  const region = req.headers['x-vercel-ip-country-region'] || '';
  const city = req.headers['x-vercel-ip-city'] || '';

  const rawVisitorId = body.visitor_id || req.headers['x-forwarded-for'] || 'anonymous';
  const anonymizedId = anonymizeVisitorId(rawVisitorId);
  const referrerDomain = extractReferrerDomain(body.referrer);

  const eventPayload = {
    event_type: body.event_type || 'pageview',
    path: body.path || '/',
    section: body.section || null,
    referrer: body.referrer || null,
    referrer_domain: referrerDomain,
    device: body.device || parsedDevice,
    browser,
    os,
    country,
    region,
    city,
    visitor_id: anonymizedId,
    session_id: body.session_id || null,
    metadata: body.metadata || {}
  };

  try {
    const result = await saveEvent(eventPayload);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      id: result.id,
      storage: result.storage
    }));
  } catch (err) {
    console.error('Track error:', err.message);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Failed to record event' }));
  }
};
