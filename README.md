# Arjun Balpande — Personal Portfolio & Analytics Engine

[![GitHub Repository](https://img.shields.io/badge/GitHub-portfolio-181717?style=flat&logo=github)](https://github.com/arjunabalpande06/portfolio)
[![Live Portfolio](https://img.shields.io/badge/Live-Demo-00f2fe?style=flat&logo=vercel&logoColor=white)](https://portfolio-arjunabalpande06.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Patent](https://img.shields.io/badge/Patent-Published-success.svg)](assets/PT_Publication_Copy_202521127272_arjun.pdf)

A modern, high-performance personal portfolio website for **Arjun Balpande** (Computer Science & Engineering student at Symbiosis Institute of Technology, Nagpur). Built with a sleek glassmorphic dark theme, lightweight vanilla web technologies, and a custom serverless **Privacy-Preserving Visitor Analytics & Admin Dashboard**.

---

## 🌟 Key Highlights & Features

- **🎨 Modern Glassmorphic Dark UI**: Custom-engineered design with dynamic ambient glows, smooth scrolling, interactive cards, and responsive layouts across all devices.
- **📊 Real-time Admin Analytics Portal (`/admin`)**:
  - Secure authentication via hashed passwords (`bcryptjs`) and HTTP-only signed session tokens (`JWT`).
  - Tracks unique visitors, page views, bounce rates, visit durations, referrers, device types, and geographic locations.
  - Anonymized visitor hashing (SHA-256 + secret salt) for GDPR/privacy compliance.
  - Interactive charts and instant CSV export for offline analysis.
- **🚀 Serverless Ready (Vercel & Local)**:
  - Dual-mode architecture: Runs seamlessly as serverless endpoints on Vercel (`api/*.js`) or on a standalone local Node.js HTTP server (`server.js`).
  - Supports persistent PostgreSQL databases (Neon, Supabase, Vercel Postgres) with automatic local JSON fallback (`data/`).
- **📑 Verified Credentials & Research Showcase**:
  - Direct downloads for an updated, ATS-compliant verified resume.
  - Modal certificate viewers for Red Hat, IBM, Infosys, and Udemy credentials.
  - Official documentation for published patents and industry internships.

---

## 🔬 Featured Projects & Research

| Project | Technologies | Highlights |
| :--- | :--- | :--- |
| **Smart Grid Energy Forecasting** | Python, LSTM, XGBoost, Random Forest | Achieved 97.4% accuracy in short-term electrical load forecasting for decentralized microgrids with live interactive predictions. |
| **Agentic AI Multi-Agent Assistant** | Python, CrewAI, LangGraph, Groq | Autonomous collaborative agent workflow executing real-time research, summarization, and data verification via tool-calling. |
| **Student Deadline Reminder Bot** | Python, Groq LLM, Telegram API | Context-aware academic assistant extracting assignment deadlines from syllabi and sending automated notification schedules. |
| **R-CNN Industrial Object Detection** | PyTorch, Faster R-CNN, OpenCV | Multi-class object detection and bounding box regression on manufacturing line components. |
| **Customer Segmentation System** *(Patent)* | Python, Scikit-learn, K-Means, PCA | Published Indian Patent (Application No: `202521127272 A`) for automated unsupervised behavioral clustering in retail. |

---

## 🛠️ Tech Stack

- **Frontend**: Semantic HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism, Ambient Orbs), Vanilla JavaScript (ES6+).
- **Backend & APIs**: Node.js, Express, Vercel Serverless Functions (`/api/*`).
- **Analytics & Security**: `jsonwebtoken`, `bcryptjs`, `cookie`, SHA-256 visitor hashing.
- **Database**: PostgreSQL (`pg`) with automatic fallback to local JSON file storage.
- **Deployment**: Vercel (Edge CDN & Serverless API routes).

---

## 📁 Repository Directory Structure

```text
PORTFOLIO/
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules (node_modules, .env, data)
├── README.md                 # Project documentation
├── index.html                # Main portfolio single-page application
├── style.css                 # Master responsive styling & animations
├── script.js                 # Interactive UI controllers, modals, filters
├── tracker.js                # Client-side privacy-first telemetry tracker
├── server.js                 # Local dev server emulating Vercel serverless routes
├── vercel.json               # Vercel deployment routes and serverless config
├── package.json              # Project metadata and dependencies
│
├── admin/                    # Admin Analytics Dashboard
│   ├── index.html            # Admin login & dashboard views
│   ├── admin.css             # Glassmorphic admin styling
│   └── admin.js              # Live metrics rendering, auth, & CSV export
│
├── api/                      # Serverless Backend Endpoints
│   ├── _auth.js              # JWT validation middleware & helper
│   ├── _db.js                # Database abstraction (Postgres / JSON fallback)
│   ├── auth.js               # Login, logout, and session check handlers
│   ├── export.js             # Analytics data export to CSV
│   ├── recent.js             # Recent visitor log retrieval
│   ├── stats.js              # Aggregated dashboard metrics (charts & KPIs)
│   └── track.js              # Ingestion endpoint for visitor telemetry
│
└── assets/                   # Static Media Assets
    ├── certificates/         # PDF & preview images for certifications (Red Hat, IBM, etc.)
    ├── internship/           # Internship letters, certificates, and code samples
    ├── Arjun_Balpande_Resume_Updated.pdf
    └── ... (profile pictures, patent documents, project previews)
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/arjunabalpande06/portfolio.git
cd portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Open `.env` and configure your credentials:

```ini
# Admin Dashboard Access Password (Required for /admin login)
ADMIN_PASSWORD=YourSecurePasswordHere

# Secret key for signing HTTP-only session cookies & JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Salt for privacy-preserving visitor SHA-256 hashing (Optional)
ANALYTICS_SALT=custom_random_salt_string

# PostgreSQL Database Connection (Optional for local dev, falls back to ./data/analytics.json)
DATABASE_URL=postgres://user:password@hostname:5432/dbname?sslmode=require

# Cookie security (set to false for localhost http://)
COOKIE_SECURE=false

# Port for local dev server
PORT=3000
```

### 4. Start the Development Server

```bash
npm run dev
# or: node server.js
```

- **Main Portfolio**: Open [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: Open [http://localhost:3000/admin](http://localhost:3000/admin) (Log in with your `ADMIN_PASSWORD`)

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Under **Project Settings > Environment Variables**, add:
   - `ADMIN_PASSWORD`: Your secret admin dashboard password.
   - `JWT_SECRET`: Random string for JWT encryption.
   - `DATABASE_URL`: Your PostgreSQL connection string (from Neon, Supabase, etc.).
   - `COOKIE_SECURE`: `true`
4. Click **Deploy**. Vercel will automatically build the static assets and deploy the `/api` directory as serverless endpoints.

---

## 📜 Intellectual Property & Certifications

- **Indian Patent**: *A System and Method for Customer Segmentation Using Machine Learning* (App No: `202521127272 A`, Published: 10/10/2025).
- **Red Hat**:
  - Red Hat Certified System Administrator (RH124)
  - Red Hat Enterprise Automation with Ansible (DO457)
  - Red Hat Python Programming (AD141)
- **IBM**: Generative AI: Prompt Engineering & Retrieval Augmented Generation (RAG).

---

## 👤 Author

**Arjun Balpande**
- **Institution**: Symbiosis Institute of Technology (SIT), Nagpur
- **LinkedIn**: [linkedin.com/in/arjun-balpande](https://linkedin.com/in/arjun-balpande)
- **GitHub**: [@arjunabalpande06](https://github.com/arjunabalpande06)
- **Email**: [arjunabalpande@gmail.com](mailto:arjunabalpande@gmail.com)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
