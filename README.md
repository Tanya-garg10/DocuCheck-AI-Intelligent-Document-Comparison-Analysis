# DocuCheck AI – Intelligent Document Comparison & Analysis

> Built for **BharatCode Build League 2026**

**DocuCheck AI** is a production-grade full-stack document intelligence platform that compares two versions of any document (PDF, DOCX, TXT) and reveals exactly what changed, what is missing, and what requires human review.

Instead of eye-straining line-by-line manual reviews, DocuCheck AI combines local high-precision syntax diffing with **BharatCode AI (`qwen-3.8-27b`)** to generate executive summaries, detect contradictory clauses, highlight numerical/date shifts, and recommend concrete actions.

---

## 🌟 Key Features

1. **Multi-Format In-Memory Extraction**:
   - Parses **PDF** documents using `pdf-parse`
   - Parses **Word Documents (.docx)** using `mammoth`
   - Parses **Plain Text (.txt, .md)** with automatic encoding normalization
   - 10MB per document limit with strict MIME and size validation
   - Documents are processed in-memory—never stored permanently on disk.

2. **Dual-Layer Analysis Engine**:
   - **Layer 1: Deterministic Syntax Engine**: Uses LCS (Longest Common Subsequence) diff algorithms to detect exact word-level and line-level additions, deletions, and modifications.
   - **Layer 2: Semantic Intelligence with BharatCode AI**: Queries `qwen-3.8-27b` via `https://bharatcode.ai/api/model/v1` to contextualize differences, flag discrepancies, and rate risk.

3. **Enterprise SaaS Results Dashboard**:
   - High-density change statistics (total modifications, added/removed word counts)
   - Visual side-by-side & unified split diff with color-coded syntax highlights (Green for additions, Red for deletions, Amber for modifications)
   - Missing fields and omitted clause detection
   - AI Insights tab with Risk Rating, Discrepancies, and Actionable Recommendations
   - Advisory notice ensuring compliance with human-in-the-loop verification

4. **1-Click Sample Demos**:
   - **Employment Offer Letter**: Demonstrates salary revision (₹6,00,000 -> ₹7,20,000), title change, and location shift.
   - **Non-Disclosure Agreement (NDA)**: Demonstrates jurisdiction changes, confidentiality duration reduction, and omitted indemnification clauses.

5. **Downloadable Comparison Report**:
   - Generates client-side formatted PDF reports with complete change breakdowns, metadata, and AI findings.

6. **Zero-Downtime Fallback Architecture**:
   - If the BharatCode API key is not configured or external network is unavailable, the local comparison engine still computes 100% verified textual diffs and provides heuristic analysis.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React 19 + Tailwind v4                   │
│   (Landing Page, Comparison Studio, Diff Viewer, PDF Export)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / Multipart Form-Data
┌──────────────────────────────▼──────────────────────────────┐
│                    Express.js Backend                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Multer (Memory Storage) -> Format Detect & Text Extract│ │
│  │ (pdf-parse / mammoth / text normalizer)                │ │
│  └───────────────────────────┬────────────────────────────┘ │
│  ┌───────────────────────────▼────────────────────────────┐ │
│  │ diff Library: LCS line & word syntactic comparison     │ │
│  └───────────────────────────┬────────────────────────────┘ │
│  ┌───────────────────────────▼────────────────────────────┐ │
│  │ BharatCode AI Service (qwen-3.8-27b @ bharatcode.ai)   │ │
│  │ Fallback: Local Heuristic Analysis Engine             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, jsPDF
- **Backend**: Node.js, Express, Multer, `pdf-parse`, `mammoth`, `diff`
- **AI Model**: BharatCode AI (`qwen-3.8-27b`)
- **API Base**: `https://bharatcode.ai/api/model/v1`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd docucheck-ai

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your BharatCode API key:
```env
BHARATCODE_API_KEY="your_bharatcode_api_key_here"
PORT=3000
```
*(Note: If left empty, DocuCheck AI will seamlessly run using the local diff and heuristic analysis engine without crashing).*

### 4. Running the Application
```bash
# Start full-stack dev server (Express backend + Vite frontend)
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔒 Security & Privacy

- Documents are processed exclusively in volatile memory and never persisted to disks or databases.
- BharatCode AI requests use `store: false` to ensure inputs are not retained for training.
- API keys are handled server-side only; zero secrets are exposed to the browser bundle.

---

## 📄 License
Apache-2.0. Built for BharatCode Build League 2026.
