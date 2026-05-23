# AlgoLens — AI-Powered Algorithm Complexity Analyzer

![AlgoLens](https://img.shields.io/badge/AlgoLens-v2.0.0-22c55e?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square)
![Railway](https://img.shields.io/badge/Backend-Railway-purple?style=flat-square)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)

---

# 🚀 Live Demo

### Frontend
https://algo-complexity-visualizer.vercel.app/

### Backend API
https://ai-powered-algo-complexity-visualizer-production.up.railway.app/

---

# 📌 Overview

AlgoLens is a full-stack AI-powered algorithm complexity analysis platform that enables users to analyze, visualize, benchmark, and optimize algorithms interactively.

Users can paste code snippets in multiple programming languages and instantly receive:
- Time complexity analysis
- Space complexity estimation
- AI-generated optimization suggestions
- Interactive complexity visualizations
- Benchmark graphs
- Algorithm pattern detection
- Historical analytics dashboard

The platform combines modern frontend engineering, scalable backend architecture, AI-assisted analysis, and real-time visualization into a production-ready educational and developer tool.

---

# 🔥 Key Highlights

- Full-stack MERN architecture
- AI-powered complexity analysis
- Interactive algorithm visualizations
- Real-time benchmarking engine
- JWT authentication system
- Cloud deployment with Vercel + Railway
- MongoDB Atlas integration
- Responsive modern UI/UX
- Production-ready API architecture
- Real-time empirical benchmarking
- PDF report generation
- Protected REST APIs
- Dynamic charts and dashboards

---

# ✨ Features

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

# 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Editor | Monaco Editor (@monaco-editor/react) |
| Charts | Recharts |
| State Management | Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT + bcryptjs |
| AI Integration | OpenRouter API |
| Routing | React Router v6 |
| Deployment | Vercel + Railway |

---

# ☁️ Deployment Architecture

```txt
Vercel (Frontend)
        ↓
Railway (Backend API)
        ↓
MongoDB Atlas (Database)
```

---

# 🌍 Production Deployment

## Frontend Deployment (Vercel)

```bash
npm run build
```

Deploy the `dist/` folder to Vercel.

Environment Variable:

```env
VITE_API_URL=https://ai-powered-algo-complexity-visualizer-production.up.railway.app
```

---

## Backend Deployment (Railway)

Environment Variables:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENROUTER_API_KEY=your_api_key
FRONTEND_URL=https://algo-complexity-visualizer.vercel.app
```

Start Command:

```bash
npm start
```

---

## Database

MongoDB Atlas Cloud Database is used for:
- Authentication
- Analysis history
- Dashboard analytics
- User management
- Persistent storage

---

# 📂 Project Structure

```bash
algo-analyzer/
├── frontend/
├── backend/
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/manoj-cyb-45/ai-powered-algo-complexity-visualizer.git

cd ai-powered-algo-complexity-visualizer
```

---

# 🔧 Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENROUTER_API_KEY=your_api_key
FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

# 💻 Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

---

# 📊 API Endpoints

## Authentication

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |

---

## Analysis

| Method | Endpoint |
|--------|----------|
| POST | `/api/analysis/analyze` |
| GET | `/api/analysis/:id` |
| DELETE | `/api/analysis/:id` |

---

## History

| Method | Endpoint |
|--------|----------|
| GET | `/api/history` |
| GET | `/api/history/stats` |

---

# 📈 Visualizer Module

## Features Included

- Linear Search Visualization
- Binary Search Visualization
- Bubble Sort Animation
- Merge Sort Visualization
- Quick Sort Visualization
- Complexity Benchmark Charts
- Empirical vs Theoretical Comparison
- PDF Report Export
- Comparative Runtime Analysis
- Dynamic Input Generator
- Best/Average/Worst Case Benchmarking

---

# 🔒 Security Features

- JWT Authentication
- Protected Routes
- Rate Limiting
- Secure Password Hashing
- Environment Variable Protection
- CORS Security
- API Validation
- Global Error Handling

---

# 📸 Screenshots

Add screenshots for:
- Dashboard
- Analyzer
- Visualizer
- Benchmark Charts
- Authentication Pages
- Complexity Graphs

---

# 🚀 Future Improvements

- Docker Support
- CI/CD Pipelines
- Kubernetes Deployment
- Dark/Light Themes
- Advanced AI Models
- Multi-user Collaboration
- Leaderboards
- Algorithm Recommendation Engine
- Exportable Benchmark Reports

---

# 📜 License

Licensed under the Apache License 2.0.

Copyright 2026 Manoj Kumar P

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this project except in compliance with the License.

You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.

---

# 👨‍💻 Author

### Manoj Kumar P

GitHub:
https://github.com/manoj-cyb-45
