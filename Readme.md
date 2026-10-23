# 🚀 TalentFlow AI — Smart ATS Hiring Suite

> **AI-Powered Applicant Tracking System** 

## 📌 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [AI Intelligence Module](#ai-intelligence-module)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)

---

## Overview

**TalentFlow AI** is a production-grade, AI-driven Applicant Tracking System that streamlines modern hiring through intelligent automation. Built as a complete full-stack application with two distinct versions — a clean professional default and a dark premium enterprise edition.

The platform combines resume parsing, semantic candidate evaluation, explainable AI scoring, and recruiter-friendly workflows into a single cohesive product.

## Live Demo
https://smart-ats-omega.vercel.app

## Login credentials 
id- garvit@apple.com
pass- apple

## Features

### Part 1 — Core ATS Platform

| Feature | Status |
|---------|--------|
| User Authentication (JWT + Refresh Tokens) | ✅ |
| Role-Based Access Control (Admin, Recruiter, Hiring Manager) | ✅ |
| Job Posting Management (CRUD + Status Toggle) | ✅ |
| AI Resume Parsing & Candidate Profile Extraction | ✅ |
| Candidate Pipeline Tracking (Kanban Board) | ✅ |
| Semantic Candidate Matching | ✅ |
| AI-Powered Candidate Scoring & Recommendations | ✅ |
| Advanced Search & Filters | ✅ |
| Recruitment Dashboard & Analytics (Recharts) | ✅ |
| Interview Scheduling Workflow | ✅ |
| Email Automation (Nodemailer) | ✅ |
| Responsive UI (1440px Desktop + 390px Mobile) | ✅ |

### Part 2 — AI Intelligence Module

| Feature | Status |
|---------|--------|
| Resume Parsing using Groq LLaMA 3.3 70B | ✅ |
| Skill Matching against Job Descriptions | ✅ |
| Candidate Ranking by Relevance (Fit Score 0-100) | ✅ |
| Explainable AI Recommendations | ✅ |
| Keyword Extraction & Resume Insights | ✅ |
| Candidate Fit Score with Breakdown | ✅ |
| Duplicate Candidate Detection | ✅ |
| Smart Shortlisting Suggestions | ✅ |
| AI Interview Question Generator | ✅ |
| AI Job Description Generator | ✅ |

### Part 3 — Premium Version

| Feature | Status |
|---------|--------|
| Dark Enterprise UI Theme | ✅ |
| Separate Premium Landing Page | ✅ |
| Candidate Comparison Tool (AI) | ✅ |
| Resume Analysis Dashboard | ✅ |
| AI Matching Page | ✅ |
| Premium Feature Gating | ✅ |

---

## Tech Stack

### Frontend
- **React.js** (Vite) — Component-based UI
- **React Router v6** — Client-side routing
- **Recharts** — Analytics charts
- **Axios** — HTTP client with interceptors
- **React Hot Toast** — Notifications
- **Lucide React** — Icons

### Backend
- **Node.js + Express.js** — REST API server
- **MongoDB + Mongoose** — Database & ODM
- **JWT + Refresh Tokens** — Stateful authentication
- **Bcrypt** — Password & token hashing
- **Multer** — File upload handling
- **PDF-Parse** — Resume text extraction
- **Nodemailer** — Email automation

### AI & Intelligence
- **Groq API** (LLaMA 3.3 70B Versatile) — Resume parsing, scoring, question generation
- **Regex fallbacks** — Email/phone extraction when AI misses

### Deployment
- **Vercel** — Frontend hosting
- **Render** — Backend hosting
- **MongoDB Atlas** — Cloud database

---

## AI Intelligence Module

This is the core differentiator of the platform. Here's exactly how it works:

### Resume Parsing Flow
```
PDF Upload → pdf-parse extracts raw text → Groq LLaMA 3.3 prompt →
Structured JSON (name, email, skills[], experience[], education[], keywords[]) →
Saved to MongoDB Candidate model
```

### Fit Score Algorithm
```
Candidate Skills vs Job Requirements → Skill Match % (0-100)
Candidate Experience vs Required Years → Experience Match % (0-100)
Candidate Keywords vs Job Description → Keyword Overlap % (0-100)

Final Fit Score = Weighted average via Groq AI
Score Breakdown stored in Application.aiAnalysis
```

### Explainability
Every score comes with:
- `matchedSkills[]` — skills the candidate has that match the job
- `missingSkills[]` — required skills the candidate lacks
- `extraSkills[]` — bonus skills beyond requirements
- `recommendation` — human-readable explanation
- `shortlistSuggestion` — boolean AI recommendation

### Duplicate Detection
```
New candidate email → check existing candidates by email →
If match found: isDuplicate: true, duplicateOf: <candidateId>
Fallback: phone number matching
```

---

## Project Structure

```
smartats/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js             # Axios instance + interceptors
│   │   │   └── index.js             # All API functions
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx       # Default app shell
│   │   │   │   └── PremiumLayout.jsx # Dark premium shell
│   │   │   └── ui/
│   │   │       └── PremiumGate.jsx  # Premium feature gate
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── dashboard/           # Analytics dashboard
│   │   │   ├── jobs/                # Job CRUD + detail
│   │   │   ├── candidates/          # Candidates + AI analysis
│   │   │   ├── applications/        # Pipeline + AI match
│   │   │   ├── interviews/          # Interview scheduling
│   │   │   └── landing/             # Premium landing page
│   │   ├── themes/
│   │   │   ├── default.css          # Light theme variables
│   │   │   └── premium.css          # Dark theme variables
│   │   └── App.jsx                  # Routes
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection
│   │   │   └── multer.js            # File upload config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── job.controller.js
│   │   │   ├── candidate.controller.js
│   │   │   ├── application.controller.js
│   │   │   └── interview.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js   # JWT + role guards
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── job.model.js
│   │   │   ├── candidate.model.js
│   │   │   ├── application.model.js
│   │   │   └── interview.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── job.routes.js
│   │   │   ├── candidate.routes.js
│   │   │   ├── application.routes.js
│   │   │   └── interview.routes.js
│   │   ├── services/
│   │   │   ├── ai.service.js        # All Groq AI functions
│   │   │   └── email.service.js     # Nodemailer templates
│   │   └── utils/
│   │       └── jwt.utils.js         # JWT helpers
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Groq API key (free at console.groq.com)
- Gmail account (for email notifications)

### 1. Clone the repository
```bash
git clone https://github.com/garvit-goyal-IT/smartATS.git
cd smartats
```

### 2. Setup Backend
```bash
cd server
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open the app
```
Default version:  http://localhost:5173
Premium version:  http://localhost:5173/premium
API:              http://localhost:3400/api
Health check:     http://localhost:3400/health
```

---

## Environment Variables

### Server `.env`
```bash
PORT=3400
MONGO_URI=your_mongo_URI
ACCESS_TOKEN_SECRET_KEY=your_access_secret
REFRESH_TOKEN_SECRET_KEY=your_refresh_secre
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
GROQ_API_KEY=gsk_your_groq_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=TalentFlow AI <your_gmail@gmail.com>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client `.env`
```bash
VITE_API_URL=http://localhost:3400/api
```

---

## API Documentation

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout | Protected |
| GET  | `/api/auth/me` | Get current user | Protected |

### Jobs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | `/api/jobs` | Get all jobs (with filters) | Protected |
| POST   | `/api/jobs` | Create job | Admin/Recruiter |
| GET    | `/api/jobs/:jobId` | Get job by ID | Protected |
| PUT    | `/api/jobs/:jobId` | Update job | Admin/Recruiter |
| DELETE | `/api/jobs/:jobId` | Delete job | Admin |
| PATCH  | `/api/jobs/:jobId/status` | Toggle job status | Admin/Recruiter |
| POST   | `/api/jobs/:jobId/generate-description` | AI generate job description | Admin/Recruiter |

### Candidates
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/candidates/upload` | Upload & AI parse resume | Admin/Recruiter |
| GET  | `/api/candidates` | Get all candidates | Protected |
| GET  | `/api/candidates/:id` | Get candidate by ID | Protected |

### Applications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | `/api/applications` | Create application + AI score | Admin/Recruiter |
| GET    | `/api/applications/job/:jobId` | Get applications by job | Protected |
| PATCH  | `/api/applications/:id/status` | Update application status | Admin/Recruiter |
| GET    | `/api/applications/job/:jobId/shortlist` | Get AI shortlist suggestions | Protected |
| GET    | `/api/applications/:id/questions` | Generate AI interview questions | Protected |
| POST   | `/api/applications/compare` | AI candidate comparison | Protected |
| GET    | `/api/applications/candidate/:candidateId` | Get applications by candidate | Protected |

### Interviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | `/api/interviews` | Schedule interview | Admin/Recruiter/HM |
| GET    | `/api/interviews` | Get all interviews | Protected |
| PATCH  | `/api/interviews/:id` | Update interview result | Admin/Recruiter/HM |

---

## Design Decisions

### Why Groq instead of OpenAI?
Groq's LLaMA 3.3 70B is completely free, has generous rate limits, and delivers structured JSON output reliably. For a production ATS where resume parsing happens at scale, cost matters.

### Why stateful refresh tokens?
Storing hashed refresh tokens in MongoDB allows true session revocation — logging out actually invalidates the token server-side. This is the production-correct approach vs stateless JWT-only auth.


### Explainable AI
Every AI recommendation includes a breakdown of WHY a candidate scored a certain number — skill match %, experience match %, keyword overlap %, matched skills, and missing skills. This directly addresses the "Explainable AI" requirement and builds recruiter trust.

### Duplicate Detection
Before saving a new candidate, the system checks for existing records with the same email or phone number. Duplicates are flagged but not blocked — recruiters can still see and manage them.

---

## Contact

Built by **Garvit Goyal** 

---

*TalentFlow AI — Hire Smarter with AI* ⚡
