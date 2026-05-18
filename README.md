# AlgoLens — AI-Powered Algorithm Complexity Analyzer

A full-stack web application that analyzes algorithm complexity using AI. Paste any code snippet and get instant Big-O analysis, complexity graphs, and optimization suggestions.

![AlgoLens](https://img.shields.io/badge/AlgoLens-v1.0.0-22c55e?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square)

---

## Features

- **AI-Powered Analysis** — Time & space complexity with GPT-based explanations
- **Monaco Code Editor** — VS Code-grade editor with syntax highlighting for 10+ languages
- **Complexity Graphs** — Interactive Recharts visualization of Big-O growth curves
- **Optimization Suggestions** — Actionable AI-generated tips to improve your code
- **Pattern Detection** — Identifies loops, recursion, sorting, searching, DP patterns
- **Authentication** — JWT-based signup/login with protected routes
- **Dashboard** — Complexity distribution charts and recent activity
- **History** — Browse, view, and delete all past analyses
- **Responsive Design** — Mobile, tablet, and desktop friendly
- **Glassmorphism UI** — Modern dark theme with animated cards and smooth transitions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Editor | Monaco Editor (@monaco-editor/react) |
| Charts | Recharts |
| State | Zustand (with persistence) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | OpenRouter API (GPT-3.5/4 / Claude / Gemma) |
| Routing | React Router v6 |

---

## Project Structure

```
algo-analyzer/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # AppLayout, sidebar navigation
│   │   │   └── analyzer/      # ComplexityGraph, AnalysisResult
│   │   ├── context/
│   │   │   └── authStore.js   # Zustand auth store
│   │   ├── pages/             # LandingPage, LoginPage, SignupPage,
│   │   │                      # DashboardPage, AnalyzerPage,
│   │   │                      # HistoryPage, AboutPage
│   │   └── utils/
│   │       ├── api.js         # Axios instance with interceptors
│   │       └── complexity.js  # Complexity colors, graph data, samples
│   ├── public/favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                   # Node.js + Express backend
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # register, login, getMe
│   │   ├── analysisController.js  # analyzeCode, getAnalysis, delete
│   │   └── historyController.js   # getHistory, getStats
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt hashing)
│   │   └── Analysis.js        # Analysis results schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── analysis.js
│   │   └── history.js
│   ├── services/
│   │   └── aiService.js       # OpenRouter AI + static fallback
│   └── server.js              # Express app entry point
│
├── .env.example               # Environment variable template
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier works)
- OpenRouter API key (optional — static analysis works without it)

---

### 1. Clone / Extract

```bash
# If downloaded as ZIP:
unzip algo-analyzer.zip
cd algo-analyzer
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algo-analyzer
JWT_SECRET=your_random_secret_here
OPENROUTER_API_KEY=sk-or-...   # Get from https://openrouter.ai/keys
AI_MODEL=openai/gpt-3.5-turbo
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev    # Development (nodemon)
# or
npm start      # Production
```

Server runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

App runs at: **http://localhost:5173**

---

## Getting API Keys

### MongoDB Atlas (Free)
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Replace in `MONGODB_URI`

### OpenRouter API (AI Analysis)
1. Go to https://openrouter.ai/keys
2. Create an account and generate an API key
3. Add to `OPENROUTER_API_KEY`
4. Choose a model in `AI_MODEL`:
   - `openai/gpt-3.5-turbo` (affordable, fast)
   - `openai/gpt-4` (most accurate)
   - `anthropic/claude-3-haiku` (fast)
   - `google/gemma-2-9b-it:free` (free tier)

> **Note:** If no API key is configured, the app uses a built-in static analysis engine as fallback. It detects loops, recursion, sorting, and nested patterns without AI.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/analyze` | Analyze code complexity (protected) |
| GET | `/api/analysis/:id` | Get single analysis (protected) |
| DELETE | `/api/analysis/:id` | Delete analysis (protected) |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Paginated history (protected) |
| GET | `/api/history/stats` | Complexity stats (protected) |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, CTA |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Stats, complexity distribution, recent activity |
| `/analyzer` | Monaco editor + AI analysis results |
| `/history` | Browse and manage past analyses |
| `/about` | Big-O reference and tech stack |

---

## Production Deployment

### Backend (Railway / Render / Heroku)

```bash
# Set environment variables in your platform dashboard
# Then deploy with:
npm start
```

### Frontend (Vercel / Netlify)

```bash
# Build:
npm run build

# Deploy the /dist folder
# Set VITE_API_URL to your backend URL
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `FRONTEND_URL` | Yes | Frontend origin for CORS |
| `OPENROUTER_API_KEY` | No | OpenRouter API key (AI features) |
| `AI_MODEL` | No | OpenRouter model string |

---

## License

MIT — free to use, modify, and distribute.

---

## v2 — Visualizer Module (New Features)

### New Page: `/visualizer`

A complete algorithm visualization and benchmarking suite, accessible from the sidebar.

#### Features Added

| # | Feature | Details |
|---|---------|---------|
| 1 | **Algorithm Visualizer** | Animated array bars for Linear Search, Binary Search, Bubble Sort, Merge Sort, Quick Sort |
| 2 | **Input Generator** | Random / Sorted / Reverse / Nearly Sorted arrays, slider + presets + manual input (up to 1M elements) |
| 3 | **Real-Time Empirical Benchmarking** | `performance.now()` high-precision timing, operation counter, estimated memory |
| 4 | **Live Benchmark Charts** | Recharts line charts that update in real-time as each data point is measured |
| 5 | **Theoretical Overlays** | O(1), O(log n), O(n), O(n log n), O(n²) dashed curves auto-scaled to empirical data |
| 6 | **Best / Average / Worst Case Toggle** | Generates appropriate datasets per algorithm and case type |
| 7 | **PDF Report Download** | jsPDF + jspdf-autotable: configuration, timing, benchmark table, comparison table, optimization notes |
| 8 | **Comparative Analysis** | Side-by-side runtime curves and bar charts for Search vs Search, Sort vs Sort, or All algorithms |

#### New Files

```
frontend/src/
├── pages/
│   └── VisualizerPage.jsx          ← Main visualizer page (3 tabs)
├── components/visualizer/
│   ├── AlgorithmVisualizer.jsx     ← Animated array bars + color legend
│   ├── BenchmarkChart.jsx          ← Empirical curve + theoretical overlays
│   ├── CompareChart.jsx            ← Multi-algorithm comparison charts
│   ├── InputGenerator.jsx          ← Slider, presets, array type, case type
│   └── StatsPanel.jsx              ← Time / ops / memory / complexity badges
└── utils/
    ├── algorithms.js               ← Real implementations + benchmarkAlgorithm()
    └── pdfReport.js                ← jsPDF report generator

```

#### New Dependencies Added

```json
"jspdf": "^2.5.1",
"jspdf-autotable": "^3.8.2"
```

