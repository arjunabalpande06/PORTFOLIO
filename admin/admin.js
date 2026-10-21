/**
 * Arjun Balpande Admin Analytics Dashboard — Client Controller
 * Handles authentication checks, live data telemetry visualization,
 * Chart.js rendering, search filtering, and exports.
 */

'use strict';

let currentRange = '30d';
let currentPage = 1;
let currentSearch = '';
let currentEventType = 'all';
let autoRefreshTimer = null;

// Chart instances
let dailyChart = null;
let deviceChart = null;
let visitorTypeChart = null;
let sectionsChart = null;
let referrersChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initControls();
  initExportMenu();
});

/* ==========================================================================
   1. AUTHENTICATION CONTROLLER
   ========================================================================== */
async function initAuth() {
  const loadingEl = document.getElementById('authLoading');
  const loginView = document.getElementById('loginView');
  const dashView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const togglePwBtn = document.getElementById('togglePasswordBtn');
  const pwInput = document.getElementById('adminPassword');

  // Toggle Password Visibility
  if (togglePwBtn && pwInput) {
    togglePwBtn.addEventListener('click', () => {
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      togglePwBtn.innerHTML = isPassword
        ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  // Check current session status
  try {
    const res = await fetch('/api/auth?action=check', { cache: 'no-store' });
    const data = await res.json();
    loadingEl.classList.add('hidden');

    if (data.authenticated) {
      dashView.classList.remove('hidden');
      loginView.classList.add('hidden');
      loadAllData();
      startAutoRefresh();
    } else {
      loginView.classList.remove('hidden');
      dashView.classList.add('hidden');
    }
  } catch (err) {
    loadingEl.classList.add('hidden');
    loginView.classList.remove('hidden');
  }

  // Handle Login Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = pwInput.value.trim();
      const errorEl = document.getElementById('loginError');
      const submitBtn = document.getElementById('loginSubmitBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      if (!password) {
        showLoginError('Please enter your admin password.');
        return;
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Verifying...';

      try {
        const res = await fetch('/api/auth?action=login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const result = await res.json();

        if (res.ok && result.success) {
          errorEl.classList.add('hidden');
          pwInput.value = '';
          loginView.classList.add('hidden');
          dashView.classList.remove('hidden');
          loadAllData();
          startAutoRefresh();
        } else {
          showLoginError(result.message || 'Invalid administrative credentials.');
        }
      } catch (err) {
        showLoginError('Failed to communicate with authentication server.');
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Unlock Dashboard';
      }
    });
  }

  // Handle Logout
  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth?action=logout', { method: 'POST' });
      } catch (e) {}
      stopAutoRefresh();
      dashView.classList.add('hidden');
      loginView.classList.remove('hidden');
    });
  }
}

function showLoginError(msg) {
  const errorEl = document.getElementById('loginError');
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }
}

/* ==========================================================================
   2. DASHBOARD CONTROLS & LISTENERS
   ========================================================================== */
function initControls() {
  // Date Range Dropdown
  const rangeSelect = document.getElementById('timeRangeSelect');
  if (rangeSelect) {
    rangeSelect.addEventListener('change', (e) => {
      currentRange = e.target.value;
      loadAllData();
    });
  }

  // Refresh Button
  const refreshBtn = document.getElementById('btnRefresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      animateRefreshIcon();
      loadAllData();
    });
  }

  // Table Search Filter (Debounced)
  const searchInput = document.getElementById('tableSearchInput');
  if (searchInput) {
    let debounceTimeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        currentPage = 1;
        loadLogs();
      }, 300);
    });
  }

  // Table Event Type Filter
  const eventTypeSelect = document.getElementById('tableEventTypeSelect');
  if (eventTypeSelect) {
    eventTypeSelect.addEventListener('change', (e) => {
      currentEventType = e.target.value;
      currentPage = 1;
      loadLogs();
    });
  }

  // Pagination buttons
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadLogs();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      loadLogs();
    });
  }
}

function initExportMenu() {
  const exportBtn = document.getElementById('btnExport');
  const exportMenu = document.getElementById('exportMenu');
  if (!exportBtn || !exportMenu) return;

  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    exportMenu.classList.add('hidden');
  });
}

function animateRefreshIcon() {
  const icon = document.getElementById('refreshIcon');
  if (icon) {
    icon.style.transition = 'transform 0.6s ease';
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      icon.style.transition = 'none';
      icon.style.transform = 'rotate(0deg)';
    }, 600);
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshTimer = setInterval(() => {
    // Only refresh if tab is active
    if (!document.hidden) {
      loadAllData();
    }
  }, 30000); // 30 seconds
}

function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

function loadAllData() {
  loadStats();
  loadLogs();
}

/* ==========================================================================
   3. STATS & CHARTS CONTROLLER
   ========================================================================== */
async function loadStats() {
  try {
    const res = await fetch(`/api/stats?range=${currentRange}`, { cache: 'no-store' });
    if (res.status === 401) {
      // Session expired
      initAuth();
      return;
    }
    const data = await res.json();
    if (!data.success) return;

    // Update Storage Status Badge
    updateStorageStatus(data.storageType, data.databaseConnected);

    // Update KPI Overview Cards
    const summary = data.summary || {};
    document.getElementById('kpiTotalVisits').textContent = (summary.totalVisits || 0).toLocaleString();
    document.getElementById('kpiUniqueVisitors').textContent = (summary.totalUniqueVisitors || 0).toLocaleString();
    document.getElementById('kpiVisitsToday').textContent = (summary.visitsToday || 0).toLocaleString();
    document.getElementById('kpiVisitsYesterday').textContent = (summary.visitsYesterday || 0).toLocaleString();
    document.getElementById('kpiVisits7d').textContent = (summary.visits7d || 0).toLocaleString();
    document.getElementById('kpiVisits30d').textContent = (summary.visits30d || 0).toLocaleString();

    // Trends
    const rangeChangeEl = document.getElementById('kpiRangeChange');
    if (rangeChangeEl) {
      const change = summary.rangeChangePercent || '0%';
      rangeChangeEl.textContent = change;
      rangeChangeEl.className = 'trend-pill ' + (change.startsWith('-') ? 'down' : '');
    }

    const todayChangeEl = document.getElementById('kpiTodayChange');
    if (todayChangeEl) {
      const change = summary.todayChangePercent || '0%';
      todayChangeEl.textContent = change;
      todayChangeEl.className = 'trend-pill ' + (change.startsWith('-') ? 'down' : '');
    }

    // Render Charts
    renderCharts(data.charts || {});
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function updateStorageStatus(storageType, isDbConnected) {
  const badge = document.getElementById('storageStatusBadge');
  const text = document.getElementById('storageStatusText');
  if (!badge || !text) return;

  if (storageType === 'postgres' && isDbConnected) {
    badge.className = 'dash-status-pill';
    text.textContent = 'Postgres Database: Connected (Neon / Cloud)';
  } else {
    badge.className = 'dash-status-pill warning';
    text.textContent = 'Local File Mode (Add DATABASE_URL on Vercel for Cloud)';
  }
}

/* ==========================================================================
   4. CHART.JS VISUALIZATIONS
   ========================================================================== */
function renderCharts(charts) {
  // Chart.js default styling for dark mode
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

  // 1. Daily Visits Line Chart
  renderDailyChart(charts.daily || []);

  // 2. Device Breakdown Doughnut Chart
  renderDeviceChart(charts.devices || []);

  // 3. New vs Returning Visitors Doughnut Chart
  renderVisitorTypeChart(charts.newVsReturning || {});

  // 4. Most Visited Sections Horizontal Bar Chart
  renderSectionsChart(charts.sections || []);

  // 5. Traffic Sources Bar Chart
  renderReferrersChart(charts.referrers || []);
}

function renderDailyChart(dailyData) {
  const ctx = document.getElementById('dailyVisitsChart');
  const emptyState = document.getElementById('dailyChartEmpty');
  if (!ctx) return;

  if (!dailyData || dailyData.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (dailyChart) dailyChart.destroy();
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  const labels = dailyData.map(d => formatDateLabel(d.date));
  const visits = dailyData.map(d => Number(d.visits));
  const uniques = dailyData.map(d => Number(d.uniques || 0));

  if (dailyChart) dailyChart.destroy();

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

  dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Visits',
          data: visits,
          borderColor: '#00f2fe',
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#00f2fe',
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Unique Visitors',
          data: uniques,
          borderColor: '#a855f7',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.35,
          pointBackgroundColor: '#a855f7',
          pointRadius: 2.5,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 12, usePointStyle: true }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(13, 20, 36, 0.9)',
          borderColor: 'rgba(0, 242, 254, 0.3)',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(255, 255, 255, 0.06)' }
        }
      }
    }
  });
}

function renderDeviceChart(deviceData) {
  const ctx = document.getElementById('deviceChart');
  if (!ctx) return;

  const labels = (deviceData.length ? deviceData : [
    { device: 'desktop', count: 0 },
    { device: 'mobile', count: 0 },
    { device: 'tablet', count: 0 }
  ]).map(d => capitalize(d.device));

  const counts = (deviceData.length ? deviceData : [
    { count: 0 }, { count: 0 }, { count: 0 }
  ]).map(d => Number(d.count));

  if (deviceChart) deviceChart.destroy();

  deviceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: ['#00f2fe', '#3b82f6', '#a855f7'],
        borderColor: '#080c14',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, usePointStyle: true, padding: 16 }
        }
      },
      cutout: '72%'
    }
  });
}

function renderVisitorTypeChart(typeData) {
  const ctx = document.getElementById('visitorTypeChart');
  if (!ctx) return;

  const newCount = Number(typeData.new || 0);
  const returningCount = Number(typeData.returning || 0);

  if (visitorTypeChart) visitorTypeChart.destroy();

  visitorTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['New Visitors', 'Returning Visitors'],
      datasets: [{
        data: [newCount, returningCount],
        backgroundColor: ['#10b981', '#7928ca'],
        borderColor: '#080c14',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, usePointStyle: true, padding: 16 }
        }
      },
      cutout: '72%'
    }
  });
}

function renderSectionsChart(sectionsData) {
  const ctx = document.getElementById('sectionsChart');
  if (!ctx) return;

  const labels = sectionsData.map(s => s.name);
  const counts = sectionsData.map(s => Number(s.count));

  if (sectionsChart) sectionsChart.destroy();

  sectionsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No section data'],
      datasets: [{
        label: 'Views',
        data: counts.length ? counts : [0],
        backgroundColor: 'rgba(0, 242, 254, 0.7)',
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(255, 255, 255, 0.04)' }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

function renderReferrersChart(referrersData) {
  const ctx = document.getElementById('referrersChart');
  if (!ctx) return;

  const labels = referrersData.map(r => r.source);
  const counts = referrersData.map(r => Number(r.count));

  if (referrersChart) referrersChart.destroy();

  referrersChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['Direct'],
      datasets: [{
        label: 'Visits',
        data: counts.length ? counts : [0],
        backgroundColor: 'rgba(121, 40, 202, 0.75)',
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(255, 255, 255, 0.04)' }
        }
      }
    }
  });
}

/* ==========================================================================
   5. VISITOR LOGS TABLE CONTROLLER
   ========================================================================== */
async function loadLogs() {
  const tbody = document.getElementById('logsTableBody');
  if (!tbody) return;

  try {
    const query = new URLSearchParams({
      page: currentPage,
      limit: 15,
      range: currentRange,
      search: currentSearch,
      eventType: currentEventType
    });

    const res = await fetch(`/api/recent?${query.toString()}`, { cache: 'no-store' });
    if (res.status === 401) {
      initAuth();
      return;
    }

    const data = await res.json();
    if (!data.success) return;

    const events = data.events || [];
    const total = data.total || 0;
    const totalPages = data.totalPages || 1;

    // Update Pagination info
    const pagStart = total === 0 ? 0 : (currentPage - 1) * 15 + 1;
    const pagEnd = Math.min(currentPage * 15, total);
    document.getElementById('pagStart').textContent = pagStart;
    document.getElementById('pagEnd').textContent = pagEnd;
    document.getElementById('pagTotal').textContent = total;
    document.getElementById('pagPageNum').textContent = `Page ${currentPage} of ${totalPages}`;

    const prevBtn = document.getElementById('btnPrevPage');
    const nextBtn = document.getElementById('btnNextPage');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    if (events.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-6" style="color: var(--text-dim); text-align: center; padding: 36px 0;">
            No visitor events found matching current filters.
          </td>
        </tr>
      `;
      return;
    }

    // Populate rows
    tbody.innerHTML = events.map(e => {
      const timeStr = formatTimestamp(e.created_at);
      const eventBadge = getEventBadge(e.event_type);
      const target = escapeHTML(e.section || e.path || '/');
      const referrer = escapeHTML(e.referrer_domain || 'Direct / None');
      const device = capitalize(e.device || 'desktop');
      const os = escapeHTML(e.os || 'Unknown');
      const browser = escapeHTML(e.browser || 'Unknown');
      const location = escapeHTML(e.country && e.country !== 'Direct' ? `${e.city ? e.city + ', ' : ''}${e.country}` : 'Direct Connection');
      const visitorBadge = e.is_new_visitor
        ? '<span class="visitor-badge new">New</span>'
        : '<span class="visitor-badge returning">Returning</span>';

      return `
        <tr>
          <td><span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${timeStr}</span></td>
          <td>${eventBadge}</td>
          <td><span class="target-badge">${target}</span></td>
          <td><span style="color: var(--text-muted);">${referrer}</span></td>
          <td><span>${device} (${os})</span></td>
          <td><span>${browser}</span></td>
          <td><span>${location}</span></td>
          <td>${visitorBadge}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-6" style="color: #fb7185; text-align: center;">
          Failed to load telemetry records.
        </td>
      </tr>
    `;
  }
}

function getEventBadge(type) {
  if (type === 'pageview') {
    return '<span class="type-tag pageview">Page View</span>';
  } else if (type === 'section_view') {
    return '<span class="type-tag section_view">Section</span>';
  } else if (type === 'click') {
    return '<span class="type-tag click">Click / DL</span>';
  }
  return `<span class="type-tag">${escapeHTML(type || 'Event')}</span>`;
}

function exportData(format) {
  window.location.href = `/api/export?format=${format}&range=${currentRange}`;
}

/* ==========================================================================
   6. UTILITY HELPERS
   ========================================================================== */
function formatDateLabel(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function formatTimestamp(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoStr;
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
