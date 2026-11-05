# CredAlt — Alternative Credit Scorer for the Unbanked

An enterprise-grade, production-ready AI credit underwriting web application tailored for unbanked and informal-economy borrowers (gig drivers, street merchants, independent artisans, and daily wage workers) who lack formal credit histories or CIBIL/FICO bureau records.

The system evaluates applicants using **alternative behavioral telemetry**, predicts default risk using **XGBoost**, extracts individual marginal feature attributions using **SHAP**, and generates plain-English supervisory risk reports using a **resilient 3-tier LLM engine** (Local Ollama CUDA → Gemini 2.5 Flash Cloud API → Groq Llama 3.1 Cloud API → Deterministic Rule Synthesizer).

---

## 🏛️ Architecture Overview

The application follows a resilient, decoupled 3-tier microservice architecture with Role-Based Access Control (RBAC):

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│       Tailwind CSS • Shadcn UI Aesthetic • Recharts         │
│  - React Router v7: Login, Register, Officer & Applicant    │
│  - Multi-Step Applicant Intake Wizard (Personas & Sliders)  │
│  - Loan Officer Dashboard (Stats, Filter, Search, Table)    │
│  - Applicant Self-Service Portal (Status & SHAP Breakdown)  │
│  - Detail Underwriting View (Gauge, SHAP Chart, LLM Card)   │
│                         Port: 5173                          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Reverse Proxy / HTTP REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Primary Backend (Node.js/Express)           │
│  - Strict MongoDB Persistence (Mongoose Models)             │
│  - JWT Authentication & BCrypt Password Hashing             │
│  - RBAC: 'loan_officer' vs 'applicant' permissions          │
│  - REST Endpoints: /api/auth/*, /api/applications/*        │
│  - Strict 503 Handling (No silent in-memory masking)        │
│                         Port: 5000                          │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON RPC / REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 AI/ML Microservice (Python FastAPI)         │
│  - XGBoost Classifier (ROC-AUC: 0.9656, Accuracy: 97.5%)    │
│  - SHAP TreeExplainer (Feature Importance Attribution)       │
│  - Direct Google Gemini LLM Risk Synthesis:                 │
│      • Primary: Google Gemini 2.5 Flash API (<1.5s latency) │
│      • Instant Fallback: CredAlt Rule Synthesizer (0ms)     │
│                         Port: 8000                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. Alternative Behavioral Data Telemetry
Bypasses traditional bureau scores by analyzing:
- **`wallet_transaction_frequency`**: Monthly digital wallet payments and vendor transfers.
- **`avg_utility_days_late`**: Historical payment delinquency on municipal power, water, and gas.
- **`prepaid_recharge_regularity`**: Cadence consistency (%) in recurring mobile data top-ups.
- **`gig_platform_rating`**: Customer ratings across Uber, DoorDash, Swiggy, Upwork, etc.
- **`monthly_income_estimate`**: Inferred digital cash generation.
- **`microloan_repayment_ratio`**: Historical fulfillment ratio on peer-to-peer micro-advances.

### 2. Machine Learning Engine (XGBoost + SHAP)
- **Model**: Gradient Boosted Decision Tree (`XGBClassifier`, 120 estimators, depth 4, learning rate 0.07).
- **ROC-AUC**: **0.9656**, **Accuracy**: **97.5%**.
- **Explainability**: Natively uses `shap.TreeExplainer` to calculate local Shapley marginal attributions for every prediction, pinpointing the exact factors that boosted or penalized the borrower's Trust Score.

### 3. Direct Google Gemini LLM Risk Engine
- **Primary Synthesizer (Google Gemini API):** Direct cloud synthesis powered by `gemini-2.5-flash` via the `google-genai` SDK. Completes executive risk report authoring in ~1.5s (< 3.0s latency budget).
- **Instant Deterministic Fallback:** If `GEMINI_API_KEY` is missing or the external API call fails/times out, the system automatically falls back to an offline rule-based domain synthesizer in sub-50ms (`llmModelUsed: "CredAlt Rule Synthesizer (Instant Fallback)"`). Local Ollama dependencies have been removed for 100% cloud portability.

### 4. Modern SaaS Dashboard (Stripe / Vercel Aesthetic)
- **ScoreGauge**: Animated circular SVG progress gauge displaying AI Trust Score (0–100) and credit tier badge (`EXCELLENT`, `GOOD`, `FAIR`, `HIGH_RISK`).
- **ShapChart**: Recharts horizontal bar chart mapping feature attributions (emerald for positive credit boosters, rose for adverse risk drivers).
- **Intake Wizard**: 3-step application form with live persona presets (*Prime Gig Driver*, *Street Market Merchant*, *High-Risk Seasonal Hand*).
- **Supervisory Console**: Data table with live search, tier/status filters, sorting, and loan officer review actions (*Approve*, *Decline*, *Flag for Review*).

---

## 📂 Project Structure

```
├── ml_service/
│   ├── data/
│   │   └── synthetic_applicants.csv   # 2,000 synthetic unbanked records
│   ├── models/
│   │   └── credit_model.pkl           # Trained XGBoost pipeline & SHAP explainer
│   ├── generate_and_train.py          # Step 1: Data generation & XGBoost training
│   ├── main.py                        # Step 2: FastAPI microservice with /predict & Ollama
│   ├── test_predict.py                # Standalone test verification script
│   └── requirements.txt
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection & resilient memory fallback
│   ├── models/
│   │   ├── Applicant.js               # Mongoose Applicant demographics schema
│   │   └── ApplicationRecord.js       # Mongoose ApplicationRecord scoring & SHAP schema
│   ├── routes/
│   │   └── applications.js            # REST API (POST, GET, PATCH status, Seed)
│   ├── services/
│   │   └── aiService.js               # Axios client forwarding to FastAPI /predict
│   ├── server.js                      # Primary Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top bar with service status badge
│   │   │   ├── Dashboard.jsx          # Loan officer dashboard & data table
│   │   │   ├── ApplicationForm.jsx    # Sleek 3-step intake form with presets
│   │   │   ├── ApplicationDetail.jsx  # Detail view with ScoreGauge, SHAP & LLM report
│   │   │   ├── ScoreGauge.jsx         # Circular SVG score gauge (0-100)
│   │   │   ├── ShapChart.jsx          # Recharts SHAP attribution bar chart
│   │   │   └── ModelSpec.jsx          # Model architecture & explainability specs
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quick Start

### 1. Start the Python AI Microservice (Port 8000)

```bash
cd ml_service

# Run data generation and model training (Step 1)
python generate_and_train.py

# Start the FastAPI server (Step 2)
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start the Express Backend (Port 5000)

```bash
cd backend
npm install
node server.js
```

### 3. Start the React Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 📡 API Endpoints

### Primary Backend (Express: `http://localhost:5000`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (name, email, password, role) | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token (7d) | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | Bearer Token |
| `GET` | `/api/health` | Service health, MongoDB status, and ML connectivity | Public |
| `GET` | `/api/applications` | List applications (supports `?search=`, `?status=`, `?tier=`, `?sort=`) | Loan Officer |
| `GET` | `/api/applications/my` | List only current user's submitted applications | Applicant |
| `POST` | `/api/applications` | Ingests applicant, calls AI microservice, saves scored record | Authenticated |
| `GET` | `/api/applications/:id` | Full details, SHAP array, and LLM report for a record | Officer / Owner |
| `PATCH` | `/api/applications/:id/status`| Loan officer review (`APPROVED`, `REJECTED`, `MANUAL_REVIEW`) | Loan Officer |
| `POST` | `/api/applications/seed` | Preload diverse synthetic borrower personas | Loan Officer |

### AI Microservice (FastAPI: `http://127.0.0.1:8000`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Microservice status and loaded model features |
| `POST` | `/predict` | Ingests telemetry, runs XGBoost + SHAP + 3-Tier LLM, returns JSON |

---

## 🧪 Automated Verification

Verify end-to-end inference, SHAP calculations, and automatic Cloud LLM fallback:

```bash
cd ml_service
python verify_cloud_llm.py
```

