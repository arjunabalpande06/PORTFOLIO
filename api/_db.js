/**
 * Persistent Analytics Database Adapter
 * Supports managed PostgreSQL (Neon, Supabase, Vercel Postgres) via DATABASE_URL/POSTGRES_URL
 * and local file fallback (data/analytics.json) for development and offline testing.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let pool = null;
let isPostgresInitialized = false;

// Resolve database connection string
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (dbUrl) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err.message);
  }
}

// Local file fallback path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'analytics.json');

function ensureLocalFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readLocalEvents() {
  try {
    ensureLocalFile();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading local events:', err.message);
    return [];
  }
}

function writeLocalEvents(events) {
  try {
    ensureLocalFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local events:', err.message);
  }
}

/**
 * Initialize PostgreSQL Schema if connected
 */
async function initSchema() {
  if (!pool || isPostgresInitialized) return;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS portfolio_analytics (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      path VARCHAR(255) NOT NULL,
      section VARCHAR(100),
      referrer VARCHAR(500),
      referrer_domain VARCHAR(255),
      device VARCHAR(50),
      browser VARCHAR(50),
      os VARCHAR(50),
      country VARCHAR(10),
      region VARCHAR(100),
      city VARCHAR(100),
      visitor_id VARCHAR(64) NOT NULL,
      session_id VARCHAR(64),
      is_new_visitor BOOLEAN DEFAULT true,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON portfolio_analytics(created_at);
    CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON portfolio_analytics(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_path ON portfolio_analytics(path);
    CREATE INDEX IF NOT EXISTS idx_analytics_section ON portfolio_analytics(section);
  `;

  try {
    const client = await pool.connect();
    try {
      await client.query(createTableQuery);
      isPostgresInitialized = true;
      console.log('PostgreSQL portfolio_analytics schema initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('PostgreSQL schema initialization error:', err.message);
  }
}

/**
 * Record a new visitor analytics event
 */
async function saveEvent(event) {
  const timestamp = new Date();

  if (pool) {
    try {
      await initSchema();
      const client = await pool.connect();
      try {
        // Check if visitor is returning
        const checkVisitor = await client.query(
          'SELECT 1 FROM portfolio_analytics WHERE visitor_id = $1 LIMIT 1',
          [event.visitor_id]
        );
        const isNewVisitor = checkVisitor.rowCount === 0;

        const insertQuery = `
          INSERT INTO portfolio_analytics 
          (event_type, path, section, referrer, referrer_domain, device, browser, os, country, region, city, visitor_id, session_id, is_new_visitor, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id;
        `;
        const values = [
          event.event_type || 'pageview',
          event.path || '/',
          event.section || null,
          event.referrer || null,
          event.referrer_domain || null,
          event.device || 'desktop',
          event.browser || 'Unknown',
          event.os || 'Unknown',
          event.country || 'Unknown',
          event.region || 'Unknown',
          event.city || 'Unknown',
          event.visitor_id,
          event.session_id || null,
          isNewVisitor,
          JSON.stringify(event.metadata || {}),
          timestamp
        ];

        const res = await client.query(insertQuery, values);
        return { success: true, id: res.rows[0].id, storage: 'postgres', is_new_visitor: isNewVisitor };
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('PostgreSQL saveEvent error, falling back to local file:', err.message);
      // Fall through to local fallback
    }
  }

  // Local fallback
  const events = readLocalEvents();
  const isNewVisitor = !events.some(e => e.visitor_id === event.visitor_id);

  const newRecord = {
    id: events.length + 1,
    event_type: event.event_type || 'pageview',
    path: event.path || '/',
    section: event.section || null,
    referrer: event.referrer || null,
    referrer_domain: event.referrer_domain || null,
    device: event.device || 'desktop',
    browser: event.browser || 'Unknown',
    os: event.os || 'Unknown',
    country: event.country || 'Local/Direct',
    region: event.region || 'Local',
    city: event.city || 'Local',
    visitor_id: event.visitor_id,
    session_id: event.session_id || null,
    is_new_visitor: isNewVisitor,
    metadata: event.metadata || {},
    created_at: timestamp.toISOString()
  };

  events.push(newRecord);
  writeLocalEvents(events);

  return { success: true, id: newRecord.id, storage: 'local_file', is_new_visitor: isNewVisitor };
}

/**
 * Get Aggregated Analytics Statistics
 */
async function getStats(filterRange = '30d') {
  if (pool) {
    try {
      await initSchema();
      return await getPostgresStats(filterRange);
    } catch (err) {
      console.error('PostgreSQL getStats failed, using local file:', err.message);
    }
  }
  return getLocalStats(filterRange);
}

/**
 * Compute stats via PostgreSQL
 */
async function getPostgresStats(filterRange) {
  const client = await pool.connect();
  try {
    const now = new Date();
    let days = 30;
    if (filterRange === 'today') days = 1;
    else if (filterRange === '7d') days = 7;
    else if (filterRange === '30d') days = 30;
    else if (filterRange === 'all') days = 365;

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    // Total visits & unique visitors
    const totalVisitsRes = await client.query('SELECT COUNT(*) as count FROM portfolio_analytics');
    const totalVisits = parseInt(totalVisitsRes.rows[0].count, 10);

    const totalUniquesRes = await client.query('SELECT COUNT(DISTINCT visitor_id) as count FROM portfolio_analytics');
    const totalUniqueVisitors = parseInt(totalUniquesRes.rows[0].count, 10);

    // Today visits
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRes = await client.query('SELECT COUNT(*) as count FROM portfolio_analytics WHERE created_at >= $1', [todayStart]);
    const visitsToday = parseInt(todayRes.rows[0].count, 10);

    // Yesterday visits
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayRes = await client.query(
      'SELECT COUNT(*) as count FROM portfolio_analytics WHERE created_at >= $1 AND created_at < $2',
      [yesterdayStart, todayStart]
    );
    const visitsYesterday = parseInt(yesterdayRes.rows[0].count, 10);

    // Visits in range & previous period
    const rangeRes = await client.query('SELECT COUNT(*) as count FROM portfolio_analytics WHERE created_at >= $1', [startDate]);
    const visitsInRange = parseInt(rangeRes.rows[0].count, 10);

    const prevRangeRes = await client.query(
      'SELECT COUNT(*) as count FROM portfolio_analytics WHERE created_at >= $1 AND created_at < $2',
      [prevStartDate, startDate]
    );
    const visitsInPrevRange = parseInt(prevRangeRes.rows[0].count, 10);

    // Visits last 7d
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const res7d = await client.query('SELECT COUNT(*) as count FROM portfolio_analytics WHERE created_at >= $1', [sevenDaysAgo]);
    const visits7d = parseInt(res7d.rows[0].count, 10);

    // Visits last 30d
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const res30d = await client.query('SELECT COUNT(*) as count FROM portfolio_analytics WHERE created_at >= $1', [thirtyDaysAgo]);
    const visits30d = parseInt(res30d.rows[0].count, 10);

    // Daily breakdown for charts
    const dailyRes = await client.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*) as visits, COUNT(DISTINCT visitor_id) as uniques
      FROM portfolio_analytics
      WHERE created_at >= $1
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `, [startDate]);

    // Top Sections / Pages
    const sectionsRes = await client.query(`
      SELECT COALESCE(section, path) as name, COUNT(*) as count
      FROM portfolio_analytics
      WHERE created_at >= $1
      GROUP BY COALESCE(section, path)
      ORDER BY count DESC
      LIMIT 8
    `, [startDate]);

    // Device breakdown
    const devicesRes = await client.query(`
      SELECT LOWER(device) as device, COUNT(*) as count
      FROM portfolio_analytics
      WHERE created_at >= $1
      GROUP BY LOWER(device)
      ORDER BY count DESC
    `, [startDate]);

    // Referring sources
    const referrersRes = await client.query(`
      SELECT COALESCE(referrer_domain, 'Direct / None') as source, COUNT(*) as count
      FROM portfolio_analytics
      WHERE created_at >= $1
      GROUP BY COALESCE(referrer_domain, 'Direct / None')
      ORDER BY count DESC
      LIMIT 6
    `, [startDate]);

    // New vs Returning
    const newRes = await client.query(`
      SELECT is_new_visitor, COUNT(*) as count
      FROM portfolio_analytics
      WHERE created_at >= $1
      GROUP BY is_new_visitor
    `, [startDate]);

    let newCount = 0;
    let returningCount = 0;
    newRes.rows.forEach(r => {
      if (r.is_new_visitor) newCount += parseInt(r.count, 10);
      else returningCount += parseInt(r.count, 10);
    });

    // Country Breakdown
    const countryRes = await client.query(`
      SELECT country, COUNT(*) as count
      FROM portfolio_analytics
      WHERE created_at >= $1 AND country IS NOT NULL AND country != 'Unknown'
      GROUP BY country
      ORDER BY count DESC
      LIMIT 6
    `, [startDate]);

    // Browser Breakdown
    const browserRes = await client.query(`
      SELECT browser, COUNT(*) as count
      FROM portfolio_analytics
      WHERE created_at >= $1
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 5
    `, [startDate]);

    return {
      storageType: 'postgres',
      databaseConnected: true,
      summary: {
        totalVisits,
        totalUniqueVisitors,
        visitsToday,
        visitsYesterday,
        todayChangePercent: calculatePercentChange(visitsToday, visitsYesterday),
        visits7d,
        visits30d,
        visitsInRange,
        visitsInPrevRange,
        rangeChangePercent: calculatePercentChange(visitsInRange, visitsInPrevRange),
      },
      charts: {
        daily: dailyRes.rows,
        sections: sectionsRes.rows,
        devices: devicesRes.rows,
        referrers: referrersRes.rows,
        newVsReturning: {
          new: newCount,
          returning: returningCount
        },
        countries: countryRes.rows,
        browsers: browserRes.rows
      }
    };
  } finally {
    client.release();
  }
}

/**
 * Compute stats via local file fallback
 */
function getLocalStats(filterRange) {
  const events = readLocalEvents();
  const now = new Date();
  let days = 30;
  if (filterRange === 'today') days = 1;
  else if (filterRange === '7d') days = 7;
  else if (filterRange === '30d') days = 30;
  else if (filterRange === 'all') days = 365;

  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

  const totalVisits = events.length;
  const uniqueVisitorSet = new Set(events.map(e => e.visitor_id));
  const totalUniqueVisitors = uniqueVisitorSet.size;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  let visitsToday = 0;
  let visitsYesterday = 0;
  let visits7d = 0;
  let visits30d = 0;
  let visitsInRange = 0;
  let visitsInPrevRange = 0;

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dailyMap = {};
  const sectionsMap = {};
  const devicesMap = {};
  const referrersMap = {};
  const browsersMap = {};
  const countriesMap = {};
  let newCount = 0;
  let returningCount = 0;

  events.forEach(e => {
    const time = new Date(e.created_at);

    if (time >= todayStart) visitsToday++;
    if (time >= yesterdayStart && time < todayStart) visitsYesterday++;
    if (time >= sevenDaysAgo) visits7d++;
    if (time >= thirtyDaysAgo) visits30d++;

    if (time >= startDate) {
      visitsInRange++;
      // Daily trend
      const dateKey = time.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, visits: 0, uniques: new Set() };
      dailyMap[dateKey].visits++;
      dailyMap[dateKey].uniques.add(e.visitor_id);

      // Sections
      const sName = e.section || e.path || '/';
      sectionsMap[sName] = (sectionsMap[sName] || 0) + 1;

      // Devices
      const dev = (e.device || 'desktop').toLowerCase();
      devicesMap[dev] = (devicesMap[dev] || 0) + 1;

      // Referrers
      const ref = e.referrer_domain || 'Direct / None';
      referrersMap[ref] = (referrersMap[ref] || 0) + 1;

      // Browsers
      const browser = e.browser || 'Unknown';
      browsersMap[browser] = (browsersMap[browser] || 0) + 1;

      // Countries
      const c = e.country || 'Unknown';
      if (c !== 'Unknown') {
        countriesMap[c] = (countriesMap[c] || 0) + 1;
      }

      // New vs Returning
      if (e.is_new_visitor) newCount++;
      else returningCount++;
    } else if (time >= prevStartDate && time < startDate) {
      visitsInPrevRange++;
    }
  });

  const daily = Object.values(dailyMap)
    .map(d => ({ date: d.date, visits: d.visits, uniques: d.uniques.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sections = Object.entries(sectionsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const devices = Object.entries(devicesMap)
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  const referrers = Object.entries(referrersMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const browsers = Object.entries(browsersMap)
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const countries = Object.entries(countriesMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    storageType: 'local_file',
    databaseConnected: false,
    summary: {
      totalVisits,
      totalUniqueVisitors,
      visitsToday,
      visitsYesterday,
      todayChangePercent: calculatePercentChange(visitsToday, visitsYesterday),
      visits7d,
      visits30d,
      visitsInRange,
      visitsInPrevRange,
      rangeChangePercent: calculatePercentChange(visitsInRange, visitsInPrevRange),
    },
    charts: {
      daily,
      sections,
      devices,
      referrers,
      newVsReturning: {
        new: newCount,
        returning: returningCount
      },
      countries,
      browsers
    }
  };
}

/**
 * Get Paginated Recent Events
 */
async function getRecentEvents({ page = 1, limit = 20, search = '', filterRange = 'all', eventType = 'all' }) {
  if (pool) {
    try {
      await initSchema();
      const client = await pool.connect();
      try {
        let whereClauses = [];
        let params = [];
        let pIndex = 1;

        if (search) {
          whereClauses.push(`(path ILIKE $${pIndex} OR section ILIKE $${pIndex} OR referrer ILIKE $${pIndex} OR browser ILIKE $${pIndex} OR country ILIKE $${pIndex})`);
          params.push(`%${search}%`);
          pIndex++;
        }

        if (eventType && eventType !== 'all') {
          whereClauses.push(`event_type = $${pIndex}`);
          params.push(eventType);
          pIndex++;
        }

        if (filterRange && filterRange !== 'all') {
          let days = 30;
          if (filterRange === 'today') days = 1;
          else if (filterRange === '7d') days = 7;
          else if (filterRange === '30d') days = 30;
          const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          whereClauses.push(`created_at >= $${pIndex}`);
          params.push(cutoff);
          pIndex++;
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Total matching count
        const countRes = await client.query(`SELECT COUNT(*) as count FROM portfolio_analytics ${whereSql}`, params);
        const total = parseInt(countRes.rows[0].count, 10);

        // Fetch paginated events
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        const querySql = `
          SELECT id, event_type, path, section, referrer, referrer_domain, device, browser, os, country, region, city, visitor_id, is_new_visitor, metadata, created_at
          FROM portfolio_analytics
          ${whereSql}
          ORDER BY created_at DESC
          LIMIT $${pIndex} OFFSET $${pIndex + 1}
        `;
        const eventsRes = await client.query(querySql, params);

        return {
          events: eventsRes.rows,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / limit) || 1,
          limit: Number(limit)
        };
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('PostgreSQL getRecentEvents failed, falling back:', err.message);
    }
  }

  // Local fallback
  let events = readLocalEvents();

  if (filterRange && filterRange !== 'all') {
    let days = 30;
    if (filterRange === 'today') days = 1;
    else if (filterRange === '7d') days = 7;
    else if (filterRange === '30d') days = 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    events = events.filter(e => new Date(e.created_at) >= cutoff);
  }

  if (eventType && eventType !== 'all') {
    events = events.filter(e => e.event_type === eventType);
  }

  if (search) {
    const q = search.toLowerCase();
    events = events.filter(e => 
      (e.path && e.path.toLowerCase().includes(q)) ||
      (e.section && e.section.toLowerCase().includes(q)) ||
      (e.referrer && e.referrer.toLowerCase().includes(q)) ||
      (e.browser && e.browser.toLowerCase().includes(q)) ||
      (e.country && e.country.toLowerCase().includes(q))
    );
  }

  // Sort descending
  events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const total = events.length;
  const offset = (page - 1) * limit;
  const paginated = events.slice(offset, offset + limit);

  return {
    events: paginated,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit) || 1,
    limit: Number(limit)
  };
}

/**
 * Export all analytics events as JSON or CSV
 */
async function exportEvents({ format = 'json', filterRange = 'all' }) {
  const result = await getRecentEvents({ page: 1, limit: 10000, filterRange });
  const events = result.events;

  if (format === 'csv') {
    const headers = [
      'Timestamp', 'Event Type', 'Path', 'Section', 'Referrer Domain',
      'Device', 'Browser', 'OS', 'Country', 'Region', 'City', 'Visitor Type'
    ];
    const rows = events.map(e => [
      `"${new Date(e.created_at).toISOString()}"`,
      `"${e.event_type || ''}"`,
      `"${e.path || ''}"`,
      `"${e.section || ''}"`,
      `"${e.referrer_domain || 'Direct'}"`,
      `"${e.device || ''}"`,
      `"${e.browser || ''}"`,
      `"${e.os || ''}"`,
      `"${e.country || ''}"`,
      `"${e.region || ''}"`,
      `"${e.city || ''}"`,
      `"${e.is_new_visitor ? 'New' : 'Returning'}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  return JSON.stringify(events, null, 2);
}

function calculatePercentChange(current, previous) {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

module.exports = {
  saveEvent,
  getStats,
  getRecentEvents,
  exportEvents,
  initSchema
};
