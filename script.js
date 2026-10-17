/**
 * ARJUN BALPANDE PORTFOLIO — JAVASCRIPT CONTROLLER
 * JavaScript Lab CA3 Mini Project
 * Clean, Modular, Dependency-free Vanilla JavaScript
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Copyright Year
  initCopyrightYear();

  // 2. Dynamic Typing Text in Hero
  initDynamicTyping();

  // 3. Mobile Navigation Drawer & Backdrop
  initMobileNav();

  // 4. Sticky Header & Scroll Spy
  initScrollHeaderAndSpy();

  // 5. Scroll-triggered Reveal Animations
  initScrollReveal();

  // 6. Back to Top Button
  initBackToTop();

  // 7. Contact Form Real-time Validation & Feedback
  initContactForm();

  // 8. Global Keyboard Listeners (ESC for modals)
  initKeyboardA11y();
});

/* ==========================================================================
   1. DYNAMIC COPYRIGHT YEAR
   ========================================================================== */
function initCopyrightYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   2. DYNAMIC TYPING EFFECT IN HERO
   ========================================================================== */
function initDynamicTyping() {
  const typedTarget = document.getElementById('typedText');
  if (!typedTarget) return;

  const phrases = [
    'Autonomous Multi-Agent AI Systems',
    'Smart Grid Energy Forecasting & ML',
    'Intelligent Deadline & Workflow Automation',
    'AI/ML & Software Solutions',
    'R-CNN Computer Vision Models',
    'Patent-Published Clustering Research',
    'Robust Systems in Python & C',
    'Modern & Responsive Web Applications'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function typeCycle() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typedTarget.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      typedTarget.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at end of phrase
      typingSpeed = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400;
    }

    setTimeout(typeCycle, typingSpeed);
  }

  // Check if reduced motion is requested
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    typeCycle();
  } else {
    typedTarget.textContent = phrases[0];
  }
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle('open');
    toggleBtn.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen);
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', toggleMenu);

  // Close when clicking any nav link
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside of the drawer
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   4. STICKY HEADER & SCROLL SPY (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollHeaderAndSpy() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll listener for sticky header styling
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // IntersectionObserver for active section highlighting
  const observerOptions = {
    root: null,
    rootMargin: '-25% 0px -65% 0px',
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => spyObserver.observe(section));
}

/* ==========================================================================
   5. SCROLL-TRIGGERED REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   6. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const bttBtn = document.getElementById('backToTop');
  if (!bttBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      bttBtn.classList.add('visible');
    } else {
      bttBtn.classList.remove('visible');
    }
  }, { passive: true });

  bttBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   7. SKILLS FILTERING
   ========================================================================== */
window.filterSkills = function(category, element) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => btn.classList.remove('active'));

  if (element && element.classList) {
    element.classList.add('active');
  } else {
    filterBtns.forEach(btn => {
      const btnText = btn.textContent.toLowerCase();
      if (category === 'all' && btnText.includes('all')) {
        btn.classList.add('active');
      } else if (category === 'languages' && btnText.includes('lang')) {
        btn.classList.add('active');
      } else if (category === 'web' && btnText.includes('web')) {
        btn.classList.add('active');
      } else if (category === 'ai' && btnText.includes('ai')) {
        btn.classList.add('active');
      } else if (category === 'tools' && btnText.includes('tool')) {
        btn.classList.add('active');
      }
    });
  }

  skillCards.forEach(card => {
    const cardCats = (card.getAttribute('data-category') || '').toLowerCase().split(/\s+/);
    if (category === 'all' || cardCats.includes(category.toLowerCase())) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
};

/* ==========================================================================
   8. INTERACTIVE PROJECT DETAILS MODAL
   ========================================================================== */
const projectDetailsData = {
  agentic_ai: {
    tag: 'Autonomous Multi-Agent Architecture',
    title: 'Agentic AI — Multi-Agent Research Pipelines & Autonomous Fact-Checking',
    img: 'assets/project_agentic_ai.jpg',
    content: `
      <h4>Overview & Architectural Vision</h4>
      <p>This repository demonstrates production-grade autonomous agent systems designed to decompose complex queries, coordinate specialized agents sequentially, execute external tool calls for real-time web grounding, and perform high-speed LLM reasoning with state-of-the-art inference engines.</p>

      <h4>Core Subsystems & Implementations</h4>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: var(--primary); margin: 0.75rem 0 0.35rem; font-size: 1rem;">1. Flexi Agentic AI (Sequential Multi-Agent Research Pipeline)</h5>
        <p>A coordinated multi-agent workflow where distinct autonomous roles cooperate to conduct automated web research and synthesize final documentation:</p>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>PlannerAgent:</strong> Ingests user research topics, decomposes them into structured stages ("Search information", "Analyze information", "Generate report"), and outputs executable planning dictionaries.</li>
          <li><strong>SearchAgent:</strong> Interfaces with Tavily Client API to query live internet sources, retrieving up-to-date and context-relevant web snippets.</li>
          <li><strong>AnalystAgent:</strong> Parses incoming search payloads, extracts core analytical facts, titles, and summaries, and structures the findings.</li>
          <li><strong>WriterAgent:</strong> Synthesizes processed findings into a structured final dossier, printing results and persisting them directly to <code>final_report.txt</code>.</li>
        </ul>
      </div>

      <div style="margin-bottom: 1rem;">
        <h5 style="color: #a78bfa; margin: 0.75rem 0 0.35rem; font-size: 1rem;">2. Agentic AI Tavily (Autonomous Fact-Checking &amp; Tool Grounding)</h5>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>Autonomous Fact-Checker:</strong> Built with the OpenAI Agents SDK (<code>Agent</code>, <code>Runner</code>), orchestrating asynchronous validation loops (<code>asyncio</code>) with Groq's high-speed inference engine running <code>llama-3.3-70b-versatile</code>. Produces strict factuality verdicts (<code>TRUE</code> / <code>FALSE</code>) with rationales.</li>
          <li><strong>Tool-Augmented Grounding:</strong> Implements tool-calling patterns using <code>langchain_core.tools.Tool</code> and <code>TavilyClient</code> to ground language models with live search capabilities.</li>
        </ul>
      </div>

      <h4>Technologies &amp; Verified Dependencies</h4>
      <div class="tech-tag-row" style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="tech-tag">Python 3.10+</span>
        <span class="tech-tag">OpenAI Agents SDK</span>
        <span class="tech-tag">Groq API (LLaMA 3.3 70B)</span>
        <span class="tech-tag">Tavily AI Search API</span>
        <span class="tech-tag">LangChain Core</span>
        <span class="tech-tag">Asyncio</span>
        <span class="tech-tag">python-dotenv</span>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">
          <svg class="icon-xs" style="vertical-align: -2px; margin-right: 4px; display: inline-block;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          github.com/arjunabalpande06/Agentic_AI
        </span>
        <a href="https://github.com/arjunabalpande06/Agentic_AI" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary project-github-btn" style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View Source Repository on GitHub
        </a>
      </div>
    `
  },
  deadline_reminder: {
    tag: 'AI Assistant & Workflow Automation',
    title: 'Student Deadline Reminder Automation with AI Assistant',
    img: 'assets/project_deadline_reminder.jpg',
    content: `
      <h4>Overview &amp; Practical Impact</h4>
      <p>A student productivity and deadline tracking system developed to eliminate missed academic submissions. Integrates an LLM-powered natural language task parser via the Groq API with an interactive Gradio web dashboard and automated multi-stage alerts delivered directly to Telegram.</p>

      <h4>Core Subsystems &amp; Architecture</h4>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: #a78bfa; margin: 0.75rem 0 0.35rem; font-size: 1rem;">1. AI Task &amp; Deadline Assistant (Groq LLM)</h5>
        <p>Enables conversational task scheduling using natural language:</p>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>Zero-Shot Temporal Parsing:</strong> Powered by <code>openai/gpt-oss-120b</code> on Groq API to extract assignment titles, subjects, categories, and exact deadlines from queries like <em>"Remind me about my CA record submission tomorrow at 5 PM"</em>.</li>
          <li><strong>System Clock Grounding:</strong> Dynamically calculates target dates relative to current local system timestamps, preventing date confusion.</li>
          <li><strong>Hallucination Prevention:</strong> Validates input completeness; if a deadline or time is omitted, the model interactively prompts the user rather than guessing or hallucinating dates.</li>
        </ul>
      </div>

      <div style="margin-bottom: 1rem;">
        <h5 style="color: var(--primary); margin: 0.75rem 0 0.35rem; font-size: 1rem;">2. Gradio Interactive Web Dashboard (app.py)</h5>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>AI Assistant Tab:</strong> Single-click natural language task registration into the reminder queue.</li>
          <li><strong>Manual Management:</strong> Direct data entry form for student name, course subject, assignment details, due dates, and lead days.</li>
          <li><strong>Tracking &amp; Status Lifecycle:</strong> Live assignment registry showing pending/completed states with mark-as-completed and deletion utilities.</li>
        </ul>
      </div>

      <div style="margin-bottom: 1rem;">
        <h5 style="color: #fbbf24; margin: 0.75rem 0 0.35rem; font-size: 1rem;">3. Automated Multi-Tier Telegram Bot (reminder.py &amp; telegram_bot.py)</h5>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>Advance Reminder Alerts:</strong> Dispatches custom lead-time warnings when remaining days match student preferences (<code>reminder_days</code>).</li>
          <li><strong>Urgent Due-Date Notifications:</strong> Fires a high-priority <code>🚨 DEADLINE TODAY!</code> broadcast on submission day.</li>
          <li><strong>Deduplication Engine:</strong> Tracks <code>reminder_sent</code> and <code>today_reminder_sent</code> boolean flags to prevent notification spam.</li>
          <li><strong>Scheduling Compatibility:</strong> Designed to run continuously via Windows Task Scheduler or cron jobs.</li>
        </ul>
      </div>

      <h4>Technologies &amp; Verified Stack</h4>
      <div class="tech-tag-row" style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="tech-tag">Python 3.10+</span>
        <span class="tech-tag">Gradio</span>
        <span class="tech-tag">Groq API (openai/gpt-oss-120b)</span>
        <span class="tech-tag">python-telegram-bot</span>
        <span class="tech-tag">Asyncio</span>
        <span class="tech-tag">JSON Persistence</span>
        <span class="tech-tag">python-dotenv</span>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">
          <svg class="icon-xs" style="vertical-align: -2px; margin-right: 4px; display: inline-block;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          github.com/arjunabalpande06/Student_Deadline_Reminder_Automation
        </span>
        <a href="https://github.com/arjunabalpande06/Student_Deadline_Reminder_Automation" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary project-github-btn" style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View Source Repository on GitHub
        </a>
      </div>
    `
  },
  smart_grid: {
    tag: 'Energy AI & Time-Series Machine Learning',
    title: 'Smart Grid Energy Forecasting & Load Prediction Using ML',
    img: 'assets/project_smart_grid.jpg',
    content: `
      <h4>Overview &amp; Dual-Domain Scope</h4>
      <p>A portable, cross-platform machine learning and deep learning project for forecasting electrical energy demand across two operational tiers: micro-scale household consumption in Sceaux, France (2.075M+ records) and macro-scale national electrical grid demand across India. The project runs fully offline and local using modular training notebooks and Gradio web interfaces with zero cloud dependencies.</p>

      <h4>Core Forecasting Domains &amp; Methodology</h4>
      <div style="margin-bottom: 1.25rem;">
        <h5 style="color: #34d399; margin: 0.75rem 0 0.35rem; font-size: 1rem;">1. Micro-Scale Household Level (France Dataset)</h5>
        <p>Predicts 1-minute global active power consumption (kW) for an individual household across 47 months (~2.075M records):</p>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>Autoregressive Lag Features:</strong> Engineered 5 key temporal lag inputs (<code>Power_Lag_1</code>, <code>Power_Lag_5</code>, <code>Power_Lag_15</code>, <code>Power_Lag_60</code>, and <code>Power_Lag_1440</code> for 24-hr daily cycles) paired with calendar timestamps.</li>
          <li><strong>Benchmarked Models:</strong> Evaluated XGBoost, Random Forest, Linear Regression, Support Vector Regression (SVR with RBF kernel), and sequential LSTM networks.</li>
          <li><strong>Top Performance:</strong> <strong>XGBoost Regressor</strong> achieved <strong>MAE = 0.0821 kW</strong>, <strong>RMSE = 0.2161 kW</strong>, and <strong>R&sup2; = 0.9418</strong>, closely matched by Random Forest (R&sup2; = 0.9414).</li>
        </ul>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h5 style="color: #38bdf8; margin: 0.75rem 0 0.35rem; font-size: 1rem;">2. Macro-Scale National Grid Level (Indian Dataset)</h5>
        <p>Forecasts hourly national electricity demand (MW) across the all-India grid using multi-year monitor records (<code>hourlyLoadDataIndia.xlsx</code>) and auxiliary temperature series:</p>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>Deep Sequential Modeling (LSTM):</strong> Constructed a 2-Layer LSTM with Dropout (<code>LSTM(64) &rarr; Dropout(0.2) &rarr; LSTM(32) &rarr; Dropout(0.2) &rarr; Dense(16) &rarr; Dense(1)</code>) utilizing 24-hour lookback sequence windows.</li>
          <li><strong>Superior Predictive Accuracy:</strong> <strong>LSTM Deep Neural Network</strong> achieved <strong>MAE = 2,245.32 MW</strong>, <strong>RMSE = 2,904.14 MW</strong>, and an outstanding <strong>R&sup2; = +0.9779</strong>.</li>
          <li><strong>Domain Finding:</strong> Demonstrates that national electrical load requires autoregressive recurrent sequences to capture physical grid inertia and diurnal shifts, outperforming static calendar-only regressions.</li>
        </ul>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h5 style="color: #fbbf24; margin: 0.75rem 0 0.35rem; font-size: 1rem;">3. Interactive Gradio Web Interfaces</h5>
        <p>Shipped 10 dedicated Gradio applications enabling instant local web browser inference without cloud setup:</p>
        <ul style="margin-left: 1.25rem; margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <li><strong>France Tabular UIs:</strong> Direct parameter controls for 5 power lag values and 6 date-time sliders (Year, Month, Day, Hour, Minute, Day of Week).</li>
          <li><strong>India Demand UIs:</strong> Date and time input parsers with sequential historical tensor lookups for real-time national MW load prediction.</li>
        </ul>
      </div>

      <h4>Model Performance Comparison</h4>
      <div style="overflow-x: auto; margin-top: 0.5rem; margin-bottom: 1rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left; font-family: var(--font-mono);">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-medium); color: var(--primary);">
              <th style="padding: 0.5rem;">Domain / Scale</th>
              <th style="padding: 0.5rem;">Best Model</th>
              <th style="padding: 0.5rem;">MAE</th>
              <th style="padding: 0.5rem;">RMSE</th>
              <th style="padding: 0.5rem;">R&sup2; Score</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.5rem; color: #f1f5f9;">Household (France, 1-min)</td>
              <td style="padding: 0.5rem; color: #34d399; font-weight: 700;">XGBoost (Lag Features)</td>
              <td style="padding: 0.5rem;">0.0821 kW</td>
              <td style="padding: 0.5rem;">0.2161 kW</td>
              <td style="padding: 0.5rem; color: #34d399; font-weight: 700;">0.9418</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.5rem; color: #f1f5f9;">Household (France, 1-min)</td>
              <td style="padding: 0.5rem;">Random Forest</td>
              <td style="padding: 0.5rem;">0.0829 kW</td>
              <td style="padding: 0.5rem;">0.2168 kW</td>
              <td style="padding: 0.5rem;">0.9414</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 0.5rem; color: #f1f5f9;">National Grid (India, 1-hr)</td>
              <td style="padding: 0.5rem; color: #38bdf8; font-weight: 700;">LSTM (24-step Sequence)</td>
              <td style="padding: 0.5rem;">2,245.32 MW</td>
              <td style="padding: 0.5rem;">2,904.14 MW</td>
              <td style="padding: 0.5rem; color: #38bdf8; font-weight: 700;">0.9779</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Technologies &amp; Verified Stack</h4>
      <div class="tech-tag-row" style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="tech-tag">Python 3.10+</span>
        <span class="tech-tag">TensorFlow &amp; Keras</span>
        <span class="tech-tag">LSTM Recurrent Networks</span>
        <span class="tech-tag">XGBoost Regressor</span>
        <span class="tech-tag">Scikit-Learn (RFR &amp; SVR)</span>
        <span class="tech-tag">Gradio Web UI</span>
        <span class="tech-tag">Pandas &amp; NumPy</span>
        <span class="tech-tag">OpenPyXL</span>
        <span class="tech-tag">Joblib Serialization</span>
        <span class="tech-tag">Jupyter Notebooks</span>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">
          <svg class="icon-xs" style="vertical-align: -2px; margin-right: 4px; display: inline-block;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          github.com/arjunabalpande06/Smart_Grid_Energy_Forecasting_Using_ML
        </span>
        <a href="https://github.com/arjunabalpande06/Smart_Grid_Energy_Forecasting_Using_ML" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary project-github-btn" style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View Source Repository on GitHub
        </a>
      </div>
    `
  },
  rcnn: {
    tag: 'Computer Vision & Deep Learning',
    title: 'Image Detection using R-CNN (Region-Based CNN)',
    img: 'assets/project_rcnn.jpg',
    content: `
      <h4>Overview & Research Goal</h4>
      <p>This project explores deep learning-driven object detection utilizing the R-CNN (Region-based Convolutional Neural Network) architecture. Traditional CNNs perform full-image classification; this research implemented region proposals to simultaneously localize and classify multiple discrete objects in complex scene imagery.</p>
      
      <h4>Technical Architecture & Methodology</h4>
      <ul>
        <li><strong>Region Proposal Generation:</strong> Employed Selective Search algorithms to propose potential bounding-box regions of interest (~2,000 candidate regions per input image).</li>
        <li><strong>Feature Extraction:</strong> Utilized deep convolutional neural network backbones in TensorFlow and Keras to extract robust fixed-length feature representations from proposed regions.</li>
        <li><strong>Classification & Localization:</strong> Trained multi-class classifiers for precise category identification alongside linear regression models for tight bounding box refinement.</li>
        <li><strong>Image Preprocessing:</strong> OpenCV pipeline for image resizing, normalizations, color conversions, and non-maximum suppression (NMS) to eliminate duplicate detections.</li>
      </ul>

      <h4>Key Results</h4>
      <p>Achieved high localization accuracy across multi-target street scenes and verified object coordinates with minimal false-positive overlap.</p>
      
      <div class="tech-tag-row" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="tech-tag">Python 3</span>
        <span class="tech-tag">TensorFlow / Keras</span>
        <span class="tech-tag">OpenCV</span>
        <span class="tech-tag">Selective Search</span>
        <span class="tech-tag">NumPy</span>
      </div>
    `
  },
  clustering: {
    tag: 'Intellectual Property & Machine Learning',
    title: 'Customer Segmentation using Python (Patent Published)',
    img: 'assets/project_clustering.jpg',
    content: `
      <h4>Official Patent Status</h4>
      <p><strong>Published Patent:</strong> Research conducted on customer purchasing habits and demographic patterns resulted in an officially registered and published patent on behavioral segmentation.</p>

      <h4>Problem Statement & Objectives</h4>
      <p>Modern e-commerce and retail platforms struggle with mass non-personalized marketing. The objective of this research was to develop an algorithmic methodology to automatically cluster high-dimensional customer behavioral profiles into distinct actionable personas.</p>

      <h4>Machine Learning Pipeline</h4>
      <ul>
        <li><strong>Data Ingestion & Cleaning:</strong> Processed transaction logs, recency, frequency, and monetary (RFM) metrics using Python and Pandas.</li>
        <li><strong>Feature Engineering & Standardization:</strong> Applied StandardScaler and Principal Component Analysis (PCA) to normalize feature weights and project multi-dimensional vectors.</li>
        <li><strong>Unsupervised Clustering:</strong> Employed K-Means clustering with Elbow Method and Silhouette Score optimizations to establish ideal centroid distribution (k=4 clusters).</li>
        <li><strong>Customer Archetypes Discovered:</strong> Grouped into High-Value Champions, Loyal Advocates, Nurture/Emerging Shoppers, and At-Risk Churn candidates.</li>
      </ul>

      <div class="tech-tag-row" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="tech-tag">Patent Published</span>
        <span class="tech-tag">Python</span>
        <span class="tech-tag">Scikit-learn</span>
        <span class="tech-tag">Pandas</span>
        <span class="tech-tag">K-Means Algorithm</span>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.82rem; color: #fbbf24; font-family: var(--font-mono); font-weight: 700;">Patent Application: 202521127272 A</span>
        <a href="assets/PT_Publication_Copy_202521127272_arjun.pdf" download="PT_Publication_Copy_202521127272_arjun.pdf" class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Official Patent Publication (PDF)
        </a>
      </div>
    `
  },
  bank: {
    tag: 'Application Development & OOP',
    title: 'Basic Bank Management System in Python',
    img: '',
    content: `
      <h4>Project Architecture</h4>
      <p>Developed an object-oriented banking application designed to handle customer account transactions with robust validation checks and structured file storage.</p>

      <h4>Features Implemented</h4>
      <ul>
        <li><strong>Account Lifecycle:</strong> Create savings/current accounts, generate unique account numbers, and assign customer profiles.</li>
        <li><strong>Financial Transactions:</strong> Deposit, withdraw with overdraft prevention, fund transfers, and balance inquiries.</li>
        <li><strong>Data Integrity & Validation:</strong> Input sanitation checks preventing negative balances or invalid inputs, with detailed exception handling.</li>
        <li><strong>Record Keeping:</strong> Transaction logs saved locally for audit trails.</li>
      </ul>

      <div class="tech-tag-row" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="tech-tag">Python</span>
        <span class="tech-tag">OOP Paradigms</span>
        <span class="tech-tag">File Handling</span>
        <span class="tech-tag">Input Validation</span>
      </div>
    `
  },
  tictactoe: {
    tag: 'Systems Programming & Algorithms',
    title: 'Classic Tic-Tac-Toe Game in C',
    img: '',
    content: `
      <h4>Implementation Overview</h4>
      <p>Engineered an interactive two-player Tic-Tac-Toe game in pure C, demonstrating control flow, 2D arrays, memory efficiency, and console I/O manipulation.</p>

      <h4>Key Logic Modules</h4>
      <ul>
        <li><strong>2D Matrix Board:</strong> 3x3 character grid representation dynamically printed to the terminal with state updates.</li>
        <li><strong>Turn Management:</strong> Alternating Player 1 ('X') and Player 2 ('O') turn logic with bound-checking to prevent illegal overwrites.</li>
        <li><strong>Win & Draw Evaluation:</strong> Constant-time matrix scanning validating rows, columns, and diagonal lines following each move.</li>
        <li><strong>Clean Modular Functions:</strong> Separated rendering, input handling, and game state checks into distinct C functions.</li>
      </ul>

      <div class="tech-tag-row" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <span class="tech-tag">C Language</span>
        <span class="tech-tag">2D Arrays</span>
        <span class="tech-tag">Game Loop Logic</span>
        <span class="tech-tag">Terminal UI</span>
      </div>
    `
  }
};

window.openProjectModal = function(key) {
  const data = projectDetailsData[key];
  if (!data) return;

  const modal = document.getElementById('projectModal');
  const tag = document.getElementById('projModalTag');
  const title = document.getElementById('projModalTitle');
  const body = document.getElementById('projModalBody');

  if (!modal || !tag || !title || !body) return;

  tag.textContent = data.tag;
  title.textContent = data.title;

  let html = '';
  if (data.img) {
    html += `
      <div class="modal-doc-viewer" style="margin-bottom: 1.25rem;">
        <img src="${data.img}" alt="${data.title}" style="max-height: 380px; width: 100%; object-fit: cover;">
      </div>
    `;
  }
  html += `<div>${data.content}</div>`;

  body.innerHTML = html;
  modal.classList.add('open');
  modal.focus();
  document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* ==========================================================================
   9. CERTIFICATE PREVIEW MODAL CONTROLLER
   ========================================================================== */
const CERTIFICATES_DATA = {
  rh124: {
    tag: 'Enterprise Linux Credential',
    title: 'Red Hat System Administration I (RH124) — Ver. 10',
    org: 'Red Hat Training',
    date: 'March 13, 2026',
    hours: '40 Credit Hours',
    signer: 'Karl Reynolds (Senior Director, Global Learning Services)',
    image: 'assets/certificates/rh124_sysadmin.png',
    doc: 'assets/certificates/rh124_sysadmin.pdf',
    verifyUrl: 'https://www.credly.com/badges/d1c9e770-ffd1-4604-b234-18d3238c214a',
    verifyLabel: 'Verify on Credly',
    desc: 'Official Red Hat curriculum establishing foundational administration competencies on Red Hat Enterprise Linux.',
    topics: [
      'Accessing the command line and managing files from the shell terminal.',
      'Managing local Linux users, groups, and password security policies.',
      'Controlling file access with Linux file system permissions.',
      'Monitoring and managing Linux processes, system services, and daemons with systemd.',
      'Configuring network interfaces, SSH secure access, and system logs.'
    ]
  },
  do457: {
    tag: 'Network Automation & DevOps',
    title: 'Network Automation with Red Hat Ansible (DO457) — Ver. 2.3',
    org: 'Red Hat Training',
    date: 'September 01, 2026',
    hours: '32 Credit Hours',
    signer: 'Karl Reynolds (Senior Director, Global Learning Services)',
    image: 'assets/certificates/redhat_ansible_do457.png',
    doc: 'assets/certificates/redhat_ansible_do457.pdf',
    verifyUrl: 'https://www.credly.com/badges/d403e8bc-0a89-4bac-bfe2-118615e1fe51',
    verifyLabel: 'Verify on Credly',
    desc: 'Enterprise training curriculum on automated network operations and configuration management with Red Hat Ansible Automation Platform.',
    topics: [
      'Executing Ansible ad-hoc commands and writing structured YAML playbooks.',
      'Automating multi-vendor network hardware switch and router configurations.',
      'Managing variables, facts, conditionals, loops, and reusable Jinja2 templates.',
      'Detecting and remediating network configuration drift automatically.'
    ]
  },
  ad141: {
    tag: 'Enterprise Python Scripting',
    title: 'Introduction to Python Programming (AD141) — Red Hat Training',
    org: 'Red Hat Training & Symbiosis Institute of Technology',
    date: 'February 17, 2025',
    hours: 'Official Academic Curriculum',
    image: 'assets/certificates/redhat_python_ad141.png',
    doc: 'assets/certificates/redhat_python_ad141.pdf',
    desc: 'Official Red Hat programming curriculum introducing modular scripting, OOP, and automation in Linux environments.',
    topics: [
      'Fundamental Python syntax, dynamic data types, and structured control flow.',
      'Modular programming with functions, standard library packages, and exception handling.',
      'Regular expressions, string manipulation, and file I/O operations.',
      'Automating OS tasks, subprocess invocation, and shell environment interactions.'
    ]
  },
  infosys_dsa: {
    tag: 'Algorithmic Problem Solving',
    title: 'Data Structures and Algorithms using Python - Part 1',
    org: 'Infosys Springboard (Wingspan)',
    date: 'October 22, 2025',
    hours: 'Comprehensive Coursework',
    image: 'assets/certificates/infosys_dsa_part1.png',
    doc: 'assets/certificates/infosys_dsa_part1.pdf',
    verifyUrl: 'https://verify.onwingspan.com',
    verifyLabel: 'Verify on Infosys Wingspan',
    desc: 'Rigorous course completion covering core data structures and algorithm analysis techniques with Python.',
    topics: [
      'Linear Data Structures: Dynamic Arrays, Singly & Doubly Linked Lists, Stacks, Queues.',
      'Algorithm Paradigms: Recursion, Divide & Conquer, Searching and Sorting implementations.',
      'Non-linear Foundations: Binary Search Trees, graph fundamentals, and traversal algorithms.',
      'Asymptotic Complexity: Rigorous Big-O time and space complexity evaluations.'
    ]
  },
  agentic_ai: {
    tag: 'Autonomous AI Systems & MCP',
    title: 'Mastering Agentic AI: From Prompt to Protocols to Production',
    org: 'Udemy',
    instructor: 'Vinit Singh',
    date: 'August 02, 2026',
    hours: '38 Total Hours',
    certId: 'UC-fc9d50fb-31ce-4c76-8da7-6ab5a86e0e2c',
    image: 'assets/certificates/udemy_agentic_ai.png',
    doc: 'assets/certificates/udemy_agentic_ai.pdf',
    verifyUrl: 'https://ude.my/UC-fc9d50fb-31ce-4c76-8da7-6ab5a86e0e2c',
    verifyLabel: 'Verify Certificate on Udemy',
    desc: 'Masterclass on autonomous LLM agent systems, Model Context Protocol (MCP), tool orchestration, and production deployments.',
    topics: [
      'Autonomous reasoning loops: ReAct frameworks, plan-and-solve patterns, reflection.',
      'Tool execution protocols and external API grounding with MCP integrations.',
      'Multi-agent collaboration architectures, stateful memory graphs, and task delegation.',
      'Production deployment, latency optimization, and robust evaluation benchmarks.'
    ]
  },
  ibm_rag: {
    tag: 'Generative AI & Semantic Retrieval',
    title: 'Introduction to Retrieval-Augmented Generation (RAG)',
    org: 'IBM SkillsBuild',
    date: 'Verified Credential',
    image: 'assets/certificates/ibm_rag.jpeg',
    doc: 'assets/certificates/ibm_rag.jpeg',
    desc: 'Digital badge credential validating foundational principles of Retrieval-Augmented Generation with foundation LLMs.',
    topics: [
      'Architectural foundations of Retrieval-Augmented Generation systems.',
      'Document chunking, text embeddings, and vector similarity search.',
      'Integrating vector databases (Chroma, FAISS) with large language models.',
      'Synthesizing factual, contextually grounded answers to eliminate hallucinations.'
    ]
  },
  ibm_ethics: {
    tag: 'Responsible AI & Governance',
    title: 'Ethical Considerations for Generative AI',
    org: 'IBM SkillsBuild',
    date: 'Verified Credential',
    image: 'assets/certificates/ibm_generative_ai_ethics.jpeg',
    doc: 'assets/certificates/ibm_generative_ai_ethics.jpeg',
    desc: 'Specialized credential examining societal impacts, ethical risks, and governance frameworks for generative AI.',
    topics: [
      'Auditing and mitigating bias in generative AI models and training datasets.',
      'Data provenance, copyright safeguards, transparency, and explainability.',
      'Privacy protection, preventing data leakage, and security in AI deployments.',
      'Implementing safety guardrails, human-in-the-loop oversight, and regulatory compliance.'
    ]
  }
};

window.openCertModal = function(certKey) {
  const data = CERTIFICATES_DATA[certKey];
  if (!data) return;

  const modal = document.getElementById('projectModal');
  const tag = document.getElementById('projModalTag');
  const title = document.getElementById('projModalTitle');
  const body = document.getElementById('projModalBody');

  if (!modal || !tag || !title || !body) return;

  tag.textContent = data.tag;
  title.textContent = data.title;

  const topicsList = data.topics && data.topics.length
    ? `<ul>${data.topics.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul>`
    : '';

  body.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-weight: 700; color: var(--primary); font-size: 0.95rem;">${escapeHTML(data.org)}</span>
        <span style="color: var(--text-dim); font-size: 0.85rem;">&bull;</span>
        <span style="color: var(--text-dim); font-size: 0.85rem;">${escapeHTML(data.date)}</span>
        ${data.hours ? `<span style="color: var(--text-dim); font-size: 0.85rem;">&bull; ${escapeHTML(data.hours)}</span>` : ''}
      </div>
      <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">${escapeHTML(data.desc)}</p>
      ${topicsList}
    </div>

    <!-- Certificate Preview Image -->
    <div style="margin-top: 1.25rem; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-subtle); background: #070a13; text-align: center;">
      <img src="${data.image}" alt="${escapeHTML(data.title)}" style="max-width: 100%; max-height: 520px; height: auto; object-fit: contain; display: block; margin: 0 auto;" />
    </div>

    <!-- Action Links -->
    <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem;">
      <div>
        ${data.verifyUrl ? `
          <a href="${data.verifyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="display: inline-flex; align-items: center; gap: 0.4rem;">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            ${escapeHTML(data.verifyLabel || 'Verify Credential')}
          </a>
        ` : ''}
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <a href="${data.doc}" download class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Original (${data.doc.endsWith('.pdf') ? 'PDF' : 'Image'})
        </a>
      </div>
    </div>
  `;

  modal.classList.add('open');
  modal.focus();
  document.body.style.overflow = 'hidden';
};

// Aliases for backwards compatibility
window.openCertInfo = window.openCertModal;
window.viewCertificate = window.openCertModal;

/* ==========================================================================
   INTERNSHIP DOCUMENT PREVIEW MODAL
   ========================================================================== */
const INTERNSHIP_DOCS_DATA = {
  cert: {
    tag: 'Official Experience Certificate',
    title: 'Experience Certificate — Syteos Labs LLP',
    image: 'assets/internship/experience_certificate.png',
    doc: 'assets/internship/experience_certificate.pdf',
    desc: 'Formal Experience Certificate issued by Syteos Labs LLP certifying that Arjun Balpande successfully completed his Full Stack Web Development Internship from 24 May 2026 to 24 June 2026.',
    details: [
      'Role: Full Stack Web Development Intern',
      'Organization: Syteos Labs LLP, Hinjawadi, Pune, Maharashtra',
      'Signatory: Shreyash Kapse, Director',
      'Duration: 24 May 2026 to 24 June 2026 (4 Weeks)',
      'Scope: Web interface development, backend services, database integration, and remote agile workflows.'
    ]
  },
  offer: {
    tag: 'Official Appointment Offer',
    title: 'Internship Offer Letter (ID: SYT2026-001) — Syteos Labs LLP',
    image: 'assets/internship/internship_offer_letter.png',
    doc: 'assets/internship/internship_offer_letter.pdf',
    desc: 'Official offer letter for Full Stack Web Development Summer Internship at Syteos Labs LLP specifying program outcomes, remote execution parameters, and technical scope.',
    details: [
      'Intern ID: SYT2026-001',
      'Date of Offer: 24 May 2026',
      'Duration: 4 Weeks (24 May 2026 – 24 June 2026)',
      'Domain: Full Stack Web Development',
      'Mode: Work From Home (Remote Internship)'
    ]
  },
  company: {
    tag: 'Organizational Profile & Mentorship',
    title: 'Company Profile & CTO Mentorship Record — Syteos Labs LLP',
    image: 'assets/internship/company_and_mentorship_detail.png',
    doc: 'assets/internship/company_and_mentorship_detail.pdf',
    desc: 'Official corporate dossier of Syteos Labs LLP detailing company history, service offerings, business automation services, and executive mentorship statement by CTO Vaibhav Ugile.',
    details: [
      'Executive Mentor: Mr. Vaibhav Ugile, Chief Technical Officer (CTO)',
      'Head Office: Office No. 201, Xion Mall, Hinjawadi, Pune, Maharashtra 411057',
      'Core Capabilities: Custom Software, Full Stack Web Development, Cloud Solutions, Database Integration',
      'Website: www.syteoslabs.com | Phone: +91-9764767007'
    ]
  },
  kodbud_code: {
    tag: 'Verified Internship Code Deliverables',
    title: 'Python Development Internship Tasks & Modules — KodBud',
    image: '',
    doc: 'assets/internship/kodbud/Internship_KodBud/Contact_Book.py',
    codeTitle: 'Contact_Book.py — In-Memory CRUD Contact Management System',
    codeSnippet: `contacts = []

def add_contact():
    name = input("Enter name: ")
    phone = input("Enter phone: ")
    contacts.append({"name": name, "phone": phone})
    print("Contact added!")

def view_contacts():
    if not contacts:
        print("No contacts found")
    else:
        for c in contacts:
            print(c["name"], "-", c["phone"])

def search_contact():
    name = input("Enter name to search: ")
    found = False
    for c in contacts:
        if c["name"].lower() == name.lower():
            print("Found:", c["name"], "-", c["phone"])
            found = True
    if not found:
        print("Contact not found")`,
    desc: 'Verified Python source code developed and submitted during the KodBud internship, containing 4 completed functional applications: Contact Book, Password Checker, Calculator, and Number Guessing Game.',
    details: [
      'Organization: KodBud (Virtual / Remote Internship)',
      'Role: Python Developer Intern [Documented via Project Files / Edit if official title differs]',
      'Duration: March 2026 – April 2026 [Documented Code Period / Editable Placeholder]',
      'Task 1 (Contact_Book.py): Full CRUD Contact Management system with list/dict state management and case-insensitive search.',
      'Task 2 (Password Checker.py): Security validator verifying 8+ character length, uppercase letters, numeric digits, and special characters.',
      'Task 3 (Calcy.py): Terminal arithmetic calculator with operator routing (+, -, *, /) and division-by-zero validation.',
      'Task 4 (Number_GG.py): Interactive console game using Python random module, attempt tracking, and range evaluation.'
    ]
  },
  kodbud_cert: {
    tag: 'Official Credential [Editable Placeholder]',
    title: 'Internship Certificate & Experience Letter — KodBud',
    image: '',
    doc: 'assets/internship/kodbud/kodbud_certificate.pdf',
    desc: 'Official Completion Certificate / Experience Letter from KodBud certifying completion of the Python Development Internship. [Editable Placeholder: Save your official certificate PDF as assets/internship/kodbud/kodbud_certificate.pdf to enable direct download and preview].',
    details: [
      'Organization: KodBud',
      'Designated Role: Python Developer Intern [Editable Placeholder]',
      'Certificate Status: Document pending upload by student',
      'Verified Work: 4 Python CLI applications delivered and verified from Internship_KodBud.zip',
      'Instructions: When you receive your official certificate PDF from KodBud, simply place it at "assets/internship/kodbud/kodbud_certificate.pdf" to enable active document preview.'
    ]
  }
};

window.openInternshipDoc = function(docKey) {
  const data = INTERNSHIP_DOCS_DATA[docKey];
  if (!data) return;

  const modal = document.getElementById('projectModal');
  const tag = document.getElementById('projModalTag');
  const title = document.getElementById('projModalTitle');
  const body = document.getElementById('projModalBody');

  if (!modal || !tag || !title || !body) return;

  tag.textContent = data.tag;
  title.textContent = data.title;

  const detailsList = data.details && data.details.length
    ? `<ul>${data.details.map(d => `<li>${escapeHTML(d)}</li>`).join('')}</ul>`
    : '';

  const mediaSection = data.image ? `
    <div style="margin-top: 1.25rem; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-subtle); background: #070a13; text-align: center;">
      <img src="${data.image}" alt="${escapeHTML(data.title)}" style="max-width: 100%; max-height: 540px; height: auto; object-fit: contain; display: block; margin: 0 auto;" />
    </div>
  ` : (data.codeSnippet ? `
    <div style="margin-top: 1.25rem; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-subtle); background: #060910; padding: 1.25rem; text-align: left;">
      <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--primary); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
        <span>${escapeHTML(data.codeTitle || 'Python Source Preview')}</span>
      </div>
      <pre style="font-family: var(--font-mono); font-size: 0.82rem; color: #38bdf8; line-height: 1.5; overflow-x: auto; margin: 0;"><code>${escapeHTML(data.codeSnippet)}</code></pre>
    </div>
  ` : `
    <div style="margin-top: 1.25rem; border-radius: var(--radius-md); padding: 1.5rem; border: 1px dashed rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.04); text-align: center;">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📄</div>
      <h5 style="color: #fbbf24; margin-bottom: 0.35rem;">Certificate Document Placeholder</h5>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">Certificate document not found in the initial archive. Save your certificate as <code>assets/internship/kodbud/kodbud_certificate.pdf</code> to enable active preview.</p>
    </div>
  `);

  body.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">${escapeHTML(data.desc)}</p>
      ${detailsList}
    </div>

    ${mediaSection}

    <!-- Action Links -->
    <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap;">
      ${data.doc ? `
        <a href="${data.doc}" download class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          ${data.codeSnippet ? 'Download Python Script' : 'Download Document'}
        </a>
      ` : ''}
    </div>
  `;

  modal.classList.add('open');
  modal.focus();
  document.body.style.overflow = 'hidden';
};

/* ==========================================================================
   OFFICIAL PATENT PUBLICATION PREVIEW MODAL
   ========================================================================== */
window.openPatentModal = function() {
  const modal = document.getElementById('projectModal');
  const tag = document.getElementById('projModalTag');
  const title = document.getElementById('projModalTitle');
  const body = document.getElementById('projModalBody');

  if (!modal || !tag || !title || !body) return;

  tag.textContent = 'Official Intellectual Property Publication';
  title.textContent = 'A Computer-Implemented Customer Segmentation System — Patent Journal No. 01/2026';

  body.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-weight: 700; color: #fbbf24; font-size: 0.95rem;">Application No: 202521127272 A</span>
        <span style="color: var(--text-dim); font-size: 0.85rem;">&bull;</span>
        <span style="color: var(--text-dim); font-size: 0.85rem;">Filing: 15/12/2025</span>
        <span style="color: var(--text-dim); font-size: 0.85rem;">&bull;</span>
        <span style="color: #34d399; font-weight: 600; font-size: 0.85rem;">Published: 02/01/2026</span>
      </div>
      <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 0.85rem;">
        Official Patent Publication issued by the <strong>Patent Office of India</strong> in Journal Issue No. 01/2026 (Dated 02/01/2026, Page 480).
      </p>
      <ul>
        <li><strong>Title:</strong> A Computer-Implemented Customer Segmentation System.</li>
        <li><strong>Applicant:</strong> Symbiosis International (Deemed University), Pune, Maharashtra.</li>
        <li><strong>Inventors:</strong> Prof. Rajeshwar Laxminarayan Bhalla, Parth Kandikurwar, Krisha Kahate, <strong>Arjun Balpande</strong>.</li>
        <li><strong>International Classification:</strong> G06Q 30/02, G06Q 30/00, G06Q 10/06, G06F 9/54, G06F 16/906.</li>
        <li><strong>Technical Architecture:</strong> Multi-layer framework consisting of Data Layer, Model Layer (K-Means Clustering), Backend Layer (FastAPI REST APIs), Frontend Layer (Streamlit Dashboard), and Cloud Layer (AWS/Azure/GCP).</li>
        <li><strong>Official Record:</strong> 17 Pages, 10 Claims.</li>
      </ul>
    </div>

    <!-- Official Patent Journal Image Preview -->
    <div style="margin-top: 1.25rem; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-subtle); background: #070a13; text-align: center;">
      <img src="assets/patent_publication_journal.png" alt="Official Patent Journal Publication No. 202521127272 A" style="max-width: 100%; max-height: 560px; height: auto; object-fit: contain; display: block; margin: 0 auto;" />
    </div>

    <!-- Action Links -->
    <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
      <a href="assets/PT_Publication_Copy_202521127272_arjun.pdf" download="PT_Publication_Copy_202521127272_arjun.pdf" class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Official Patent Publication (PDF)
      </a>
    </div>
  `;

  modal.classList.add('open');
  modal.focus();
  document.body.style.overflow = 'hidden';
};

/* ==========================================================================
   10. CLIENT-SIDE CONTACT FORM VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');
  const statusMsg = document.getElementById('formStatusMsg');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const subjectError = document.getElementById('subjectError');
  const messageError = document.getElementById('messageError');

  // Email regex RFC 5322 standard
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  function validateField(input, errorEl, checkFn, errorText) {
    const value = input.value.trim();
    if (!checkFn(value)) {
      input.classList.add('invalid');
      input.classList.remove('valid');
      errorEl.textContent = errorText;
      return false;
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
      errorEl.textContent = '';
      return true;
    }
  }

  // Live input validation listeners
  nameInput.addEventListener('input', () => {
    validateField(nameInput, nameError, val => val.length >= 2, 'Name must be at least 2 characters long.');
  });

  emailInput.addEventListener('input', () => {
    validateField(emailInput, emailError, val => emailRegex.test(val), 'Please enter a valid email address (e.g., name@domain.com).');
  });

  subjectInput.addEventListener('input', () => {
    validateField(subjectInput, subjectError, val => val.length >= 3, 'Subject must be at least 3 characters long.');
  });

  messageInput.addEventListener('input', () => {
    validateField(messageInput, messageError, val => val.length >= 10, 'Message must be at least 10 characters long.');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validateField(nameInput, nameError, val => val.length >= 2, 'Name must be at least 2 characters long.');
    const isEmailValid = validateField(emailInput, emailError, val => emailRegex.test(val), 'Please enter a valid email address.');
    const isSubjectValid = validateField(subjectInput, subjectError, val => val.length >= 3, 'Subject must be at least 3 characters long.');
    const isMsgValid = validateField(messageInput, messageError, val => val.length >= 10, 'Message must be at least 10 characters long.');

    if (isNameValid && isEmailValid && isSubjectValid && isMsgValid) {
      // Inputs are valid!
      statusMsg.className = 'form-status-msg success';
      statusMsg.innerHTML = `
        <strong>Thank you, ${escapeHTML(nameInput.value.trim())}!</strong><br>
        Your message details have been validated by JavaScript. Since this portfolio is a static frontend deployment for CA3, you can connect directly with Arjun at <a href="mailto:arjunbalpande@gmail.com" style="color: #fff; text-decoration: underline;">arjunbalpande@gmail.com</a> or wire this form to Formspree / EmailJS.
      `;

      // Reset form
      form.reset();
      [nameInput, emailInput, subjectInput, messageInput].forEach(inp => {
        inp.classList.remove('valid');
      });
    } else {
      statusMsg.className = 'form-status-msg error';
      statusMsg.textContent = 'Please correct the highlighted fields before submitting.';
    }
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/* ==========================================================================
   11. ACCESSIBLE KEYBOARD HANDLERS
   ========================================================================== */
function initKeyboardA11y() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeProjectModal();
    }
  });

  // Close modals on backdrop click
  const modals = document.querySelectorAll('.modal-backdrop');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeProjectModal();
      }
    });
  });
}
