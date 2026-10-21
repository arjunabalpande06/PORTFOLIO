/**
 * Automated Verification Test Suite for Arjun Balpande Portfolio & Admin Analytics
 */

const http = require('http');

async function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (postData) {
      if (typeof postData === 'object') {
        postData = JSON.stringify(postData);
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING PORTFOLIO & ADMIN ANALYTICS VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Check Public Portfolio
  const resHome = await request('http://localhost:3000/');
  assert(resHome.statusCode === 200 && resHome.body.includes('Arjun Balpande'), 'Public portfolio loads successfully (200 OK)');
  assert(resHome.body.includes('tracker.js'), 'tracker.js is included in index.html');

  // 2. Check Admin Route
  const resAdmin = await request('http://localhost:3000/admin');
  assert(resAdmin.statusCode === 200 && resAdmin.body.includes('Admin Dashboard'), 'Admin dashboard loads at /admin (200 OK)');

  // 3. Check Protected API without auth
  const resStatsUnauth = await request('http://localhost:3000/api/stats');
  assert(resStatsUnauth.statusCode === 401, 'Protected /api/stats rejects unauthenticated requests (401)');

  const resRecentUnauth = await request('http://localhost:3000/api/recent');
  assert(resRecentUnauth.statusCode === 401, 'Protected /api/recent rejects unauthenticated requests (401)');

  // 4. Test Ingestion Tracking
  const resTrack1 = await request('http://localhost:3000/api/track', { method: 'POST' }, {
    event_type: 'pageview',
    path: '/',
    referrer: 'https://www.linkedin.com/in/arjun-balpande',
    visitor_id: 'test_visitor_uuid_001',
    session_id: 'test_session_uuid_001'
  });
  assert(resTrack1.statusCode === 200, 'Track pageview recorded successfully (200 OK)');

  const resTrack2 = await request('http://localhost:3000/api/track', { method: 'POST' }, {
    event_type: 'section_view',
    path: '/',
    section: '#projects',
    visitor_id: 'test_visitor_uuid_001',
    session_id: 'test_session_uuid_001'
  });
  assert(resTrack2.statusCode === 200, 'Track section view (#projects) recorded successfully');

  const resTrack3 = await request('http://localhost:3000/api/track', { method: 'POST' }, {
    event_type: 'click',
    path: '/',
    section: 'resume_download',
    metadata: { label: 'Resume PDF', href: 'assets/Arjun_Balpande_Resume.pdf' },
    visitor_id: 'test_visitor_uuid_002',
    session_id: 'test_session_uuid_002'
  });
  assert(resTrack3.statusCode === 200, 'Track resume download click recorded successfully');

  // 5. Test Login with wrong password
  const resWrongLogin = await request('http://localhost:3000/api/auth?action=login', { method: 'POST' }, {
    password: 'wrong_password_123'
  });
  assert(resWrongLogin.statusCode === 401, 'Login with incorrect password rejected (401)');

  // 6. Test Login with correct password
  const resCorrectLogin = await request('http://localhost:3000/api/auth?action=login', { method: 'POST' }, {
    password: 'ArjunAdmin2026!Secure'
  });
  assert(resCorrectLogin.statusCode === 200, 'Login with correct admin password succeeds (200 OK)');

  const cookieHeader = resCorrectLogin.headers['set-cookie'];
  assert(cookieHeader && cookieHeader.some(c => c.includes('portfolio_admin_session')), 'HTTP-only session cookie issued');

  const sessionCookie = cookieHeader ? cookieHeader[0].split(';')[0] : '';

  // 7. Test Check Auth
  const resCheckAuth = await request('http://localhost:3000/api/auth?action=check', {
    headers: { 'Cookie': sessionCookie }
  });
  const checkBody = JSON.parse(resCheckAuth.body);
  assert(checkBody.authenticated === true, 'Session check verifies authenticated status');

  // 8. Test Protected Stats with Auth Cookie
  const resStatsAuth = await request('http://localhost:3000/api/stats?range=30d', {
    headers: { 'Cookie': sessionCookie }
  });
  assert(resStatsAuth.statusCode === 200, 'Protected /api/stats returns 200 OK with auth cookie');
  const statsData = JSON.parse(resStatsAuth.body);
  assert(statsData.summary.totalVisits >= 3, 'Total visits counted correctly (>= 3)');
  assert(statsData.summary.totalUniqueVisitors >= 2, 'Unique visitors counted correctly (>= 2)');
  assert(Array.isArray(statsData.charts.sections), 'Sections chart data returned');

  // 9. Test Protected Recent Events with Auth Cookie
  const resRecentAuth = await request('http://localhost:3000/api/recent?page=1&limit=10', {
    headers: { 'Cookie': sessionCookie }
  });
  assert(resRecentAuth.statusCode === 200, 'Protected /api/recent returns 200 OK with auth cookie');
  const recentData = JSON.parse(resRecentAuth.body);
  assert(recentData.events && recentData.events.length >= 3, 'Recent visitor events retrieved');

  // 10. Test Export
  const resExport = await request('http://localhost:3000/api/export?format=csv', {
    headers: { 'Cookie': sessionCookie }
  });
  assert(resExport.statusCode === 200 && resExport.headers['content-type'].includes('text/csv'), 'Export analytics returns CSV (200 OK)');

  // 11. Test Logout
  const resLogout = await request('http://localhost:3000/api/auth?action=logout', {
    method: 'POST',
    headers: { 'Cookie': sessionCookie }
  });
  assert(resLogout.statusCode === 200, 'Logout succeeds (200 OK)');
  const logoutCookie = resLogout.headers['set-cookie'];
  assert(logoutCookie && logoutCookie[0].includes('Max-Age=0'), 'Logout clears session cookie (Max-Age=0)');

  // 12. Confirm unauthenticated after logout
  const resAfterLogout = await request('http://localhost:3000/api/stats', {
    headers: { 'Cookie': 'portfolio_admin_session=' }
  });
  assert(resAfterLogout.statusCode === 401, 'Access denied after logout (401)');

  console.log(`\n=== TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
