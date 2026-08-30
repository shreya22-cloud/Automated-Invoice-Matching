# FraudLens AI – Intelligent Invoice Matching & Fraud Detection System

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fshreya22-cloud%2FAutomated-Invoice-Matching)

**FraudLens AI** is an AI-powered Accounts Payable (AP) automation and financial fraud intelligence platform designed to ingest supplier invoices, extract structured fields, perform 3-way matching against Purchase Orders (PO) and Goods Receipt Notes (GRN), detect duplicate and anomalous billing behavior, and provide explainable risk analysis for financial administrators.

---

## 🚀 Key Modules & Architecture

1. **Document AI & OCR Extraction Pipeline**:
   - OpenCV preprocessing (grayscale, CLAHE contrast enhancement, Otsu binarization, deskewing).
   - Resilient structured extraction engine with field-level confidence scores.

2. **Automated 3-Way Matching Engine**:
   - Compares **Invoice ↔ Purchase Order (PO) ↔ Goods Receipt Note (GRN)**.
   - RapidFuzz string similarity for vendor names and item descriptions.
   - Configurable tolerance thresholds for total amount (default 0.5%), quantity (default 1 unit), and fuzzy match similarity (default 80%).

3. **Multi-Layer Fraud Detection Engine**:
   - **Rule-Based Fraud Detection**: Price inflation, quantity mismatch, missing PO/GRN, unknown vendor, duplicate submission checks.
   - **Scikit-Learn Isolation Forest Anomaly Model**: Multi-variable statistical outlier detection.
   - **Benford's Law Statistical Analysis**: First-digit frequency distribution check against expected logarithmic distribution ($P(d) = \log_{10}(1 + 1/d)$).
   - **Composite Risk Score (0 to 100)**: Low (0-20), Medium (21-50), High (51-75), Critical (76-100).

4. **AI Financial Investigation Assistant ("FraudLens GPT")**:
   - Natural language narrative generator summarizing key audit findings and recommendations.

5. **Human-in-the-Loop Review & Exception Center**:
   - Dedicated triage board for flagged invoices.
   - 3-Column Investigation Workbench (Left: Document preview, Center: 3-Way match & edit form, Right: Risk gauge & AI narrative).

6. **Immutable Audit Trail & Role-Based Access Control (RBAC)**:
   - System Admin, AP Analyst, and Financial Auditor (Read-Only) personas.
   - Comprehensive audit logging for all user actions.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.14, FastAPI, Pydantic v2, SQLAlchemy 2.0, PyJWT, OpenCV, RapidFuzz, Scikit-Learn, NumPy, Pandas, Pytest.
- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Axios.
- **Database**: SQLite (SQLAlchemy ORM with PostgreSQL compatibility).

---

## 🔑 Sample Demo Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **System Admin** | `admin@fraudlens.ai` | `password123` | Full administrative & matching threshold configuration |
| **AP Analyst** | `analyst@fraudlens.ai` | `password123` | Invoice upload, data correction, approve/reject workflow |
| **Financial Auditor** | `auditor@fraudlens.ai` | `password123` | Read-only compliance inspection & audit log access |

---

## 🚦 How to Run Locally

### 1. Backend Setup & Startup

```bash
cd backend

# Install Python requirements
pip install -r requirements.txt

# Run pytest unit test suite
$env:PYTHONPATH="."; python -m pytest tests/test_backend.py

# Start FastAPI dev server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend API Interactive Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup & Startup

```bash
cd frontend

# Install npm packages
npm install

# Run frontend production build test
npm run build

# Start Vite dev server on port 5173
npm run dev
```

Frontend Web Application URL: `http://localhost:5173`

---

## 🧪 Demonstration Workflow Steps

1. Open `http://localhost:5173/` in your browser.
2. The system auto-seeds realistic demo dataset featuring master vendors, POs, GRNs, and synthetic invoices.
3. Inspect **Executive Dashboard** summary KPI cards and Recharts visualizations.
4. Navigate to **Invoice Ledger** and click **Inspect** on `INV-1002` (Price Inflation Anomaly) or `INV-1001`.
5. Review the **3-Column Investigation Workbench**:
   - *Left*: Original invoice document preview & field validation checks.
   - *Center*: Extracted invoice data & 3-way PO/GRN matching matrix.
   - *Right*: Risk score gauge (0-100) & **AI Financial Investigation Assistant** summary narrative.
6. Navigate to **Exception Center** to triage flagged invoices.
7. Navigate to **Fraud Engine** to inspect Benford's Law digit distribution chart and ML Isolation Forest details.
8. Navigate to **Matching Settings** to adjust tolerance thresholds (Admin role).
