/**
 * Arjun Balpande Portfolio — Privacy-Safe Visitor Telemetry Tracker
 * Lightweight, non-intrusive, zero-dependency client tracking script.
 */

(function () {
  'use strict';

  // Do Not Track flag check (optional respect for strict browser settings)
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
    // We still allow privacy-safe anonymous telemetry unless strictly disabled
  }

  // 1. Generate or retrieve anonymous Visitor ID (Stored in localStorage)
  function getVisitorId() {
    const key = '_ab_vid';
    try {
      let vid = localStorage.getItem(key);
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        localStorage.setItem(key, vid);
      }
      return vid;
    } catch (e) {
      return 'anon_' + Math.random().toString(36).substring(2, 10);
    }
  }

  // 2. Generate or retrieve Session ID (Stored in sessionStorage)
  function getSessionId() {
    const key = '_ab_sid';
    try {
      let sid = sessionStorage.getItem(key);
      if (!sid) {
        sid = 's_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
        sessionStorage.setItem(key, sid);
      }
      return sid;
    } catch (e) {
      return 'sess_' + Math.random().toString(36).substring(2, 10);
    }
  }

  const visitorId = getVisitorId();
  const sessionId = getSessionId();

  // 3. Dispatch telemetry payload to /api/track
  function sendEvent(eventType, details = {}) {
    try {
      const payload = {
        event_type: eventType,
        path: window.location.pathname || '/',
        section: details.section || null,
        referrer: document.referrer || '',
        visitor_id: visitorId,
        session_id: sessionId,
        screen_width: window.innerWidth,
        metadata: details.metadata || {}
      };

      const dataStr = JSON.stringify(payload);

      // Prefer navigator.sendBeacon for reliable async delivery without blocking
      if (navigator.sendBeacon && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([dataStr], { type: 'application/json' });
        const sent = navigator.sendBeacon('/api/track', blob);
        if (sent) return;
      }

      // Fallback to fetch with keepalive
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dataStr,
        keepalive: true
      }).catch(function () {
        // Silently catch network failures or ad-blocker drops
      });
    } catch (err) {
      // Prevent any tracker error from affecting portfolio UI
    }
  }

  // 4. Initial Page View Tracking
  function initPageView() {
    sendEvent('pageview', {
      metadata: {
        title: document.title,
        lang: navigator.language || 'en'
      }
    });
  }

  // 5. Section Scroll Engagement Tracking (debounced to avoid multiple counts)
  function initSectionTracking() {
    const sections = document.querySelectorAll('section[id], header[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const seenSections = new Map(); // sectionId -> lastTrackedTimestamp

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          const sectionId = '#' + entry.target.id;
          const now = Date.now();
          const lastTracked = seenSections.get(sectionId) || 0;

          // Only track if not tracked in the last 45 seconds
          if (now - lastTracked > 45000) {
            seenSections.set(sectionId, now);
            sendEvent('section_view', {
              section: sectionId,
              metadata: {
                visibleRatio: Math.round(entry.intersectionRatio * 100)
              }
            });
          }
        }
      });
    }, {
      threshold: [0.4]
    });

    sections.forEach(sec => observer.observe(sec));
  }

  // 6. Outbound Links & Resume Downloads Click Tracking
  function initClickTracking() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link || !link.href) return;

      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').trim().substring(0, 50);

      // Resume Downloads
      if (href.includes('.pdf') || link.hasAttribute('download') || link.id === 'btnNavResume') {
        sendEvent('click', {
          section: 'resume_download',
          metadata: {
            type: 'resume_download',
            label: text || 'Resume PDF',
            href: href
          }
        });
        return;
      }

      // Outbound external links (GitHub, LinkedIn, Research, Project Demos)
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        let category = 'external_link';
        if (href.includes('github.com')) category = 'github_link';
        else if (href.includes('linkedin.com')) category = 'linkedin_link';

        sendEvent('click', {
          section: category,
          metadata: {
            type: category,
            label: text || link.getAttribute('aria-label') || href,
            href: href
          }
        });
      }
    }, { passive: true });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPageView();
      initSectionTracking();
      initClickTracking();
    });
  } else {
    initPageView();
    initSectionTracking();
    initClickTracking();
  }
})();
