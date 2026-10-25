# AI-Based Text Summarization System

> Turn lengthy text into clear, concise, and factual summaries using Google Gemini 3.8 Flash.

An end-to-end, production-grade text summarization system featuring both a **modern React + Tailwind CSS web interface** and a **Streamlit application**, backed by Python and the official Google GenAI SDK (`google-genai`).

---

## 🌟 Key Features

- **⚡ Google Gemini 3.8 Flash Engine**: Leverages the official Google GenAI Python SDK (`google-genai`) for fast, highly accurate factual text synthesis using Google's Interactions API.
- **🎨 Interactive React + Tailwind CSS UI**:
  - Dark / Light mode toggle
  - Live character, word, and reading-time counters
  - Pre-loaded sample articles for instant one-click demonstration
  - Executive prose view & structured bullet point breakdown
  - Hands-free audio readout via Web Speech API (Text-to-Speech)
  - One-click formatted `.txt` download
  - Real-time backend connectivity check
  - Responsive layout (mobile, tablet, desktop)
- **📚 Smart Semantic Chunking**: Automatically partitions texts up to 10,000 words along paragraph and sentence boundaries without truncating or losing key facts.
- **🛡️ Enterprise API Security**: API keys are isolated on the server-side (`.env` with `python-dotenv`) and are never exposed to client browsers or logs.
- **🖥️ Dual Frontend Options**:
  - **Modern React Single-Page Application** (Vite + Tailwind CSS v4 + Lucide Icons)
  - **Lightweight Streamlit Application** for quick academic demos

---

## 📁 Project Structure

```text
text-summarizer/
├── app.py                     # Streamlit frontend application
├── api.py                     # Flask REST API proxying summarizer.py for React
├── summarizer.py              # Core AI logic (Gemini SDK, chunking, prompt rules)
├── requirements.txt           # Python backend dependencies
├── .env.example               # Template for your Gemini API key
├── .gitignore                 # Secrets, cache, and build exclusions
├── README.md                  # Project documentation
├── tests/
│   ├── __init__.py
│   └── test_summarizer.py     # 32 unit tests covering all logic & mocked API
└── frontend/                  # React + Tailwind CSS modern web app
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Main app coordinator
        ├── main.jsx           # React DOM root
        ├── index.css          # Tailwind CSS v4 styles & custom utilities
        ├── utils/
        │   ├── api.js         # Fetch client for Flask backend
        │   └── samples.js     # Curated demo texts (Tech, Climate, Quantum)
        └── components/
            ├── Navbar.jsx     # Navigation, health badge, theme toggle
            ├── Hero.jsx       # Hero banner with sample chips & quick CTAs
            ├── Summarizer.jsx # Dual-pane interactive summarization workspace
            ├── HowItWorks.jsx # 3-step pipeline visual walkthrough
            ├── Features.jsx   # Capability cards with interactive hover effects
            ├── Toast.jsx      # Animated floating notifications
            └── Footer.jsx     # Tech tags, docs, and copyright credits
```

---

## 🚀 Quick Start Guide (Windows PowerShell)

### Step 1: Clone or Navigate to the Repository

```powershell
cd "d:\Text summarizing\text-summarizer"
```

### Step 2: Configure Your Gemini API Key

1. Generate a free API key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
notepad .env
```

3. Fill in your API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL_ID=gemini-3.8-flash
```

---

### Step 3: Run the Modern React + Tailwind CSS App

#### Terminal 1 — Start the Python API Backend:
```powershell
cd "d:\Text summarizing\text-summarizer"
.venv\Scripts\activate
python api.py
```
*Backend will start on `http://localhost:5000`.*

#### Terminal 2 — Start the React Frontend:
```powershell
cd "d:\Text summarizing\text-summarizer\frontend"
npm run dev
```
*Open your browser at `http://localhost:5173`.*

---

### Step 4 (Alternative): Run the Streamlit Interface

If you prefer the streamlined Streamlit interface:

```powershell
cd "d:\Text summarizing\text-summarizer"
.venv\Scripts\activate
streamlit run app.py
```
*Open your browser at `http://localhost:8501`.*

---

## 🧪 Running Automated Unit Tests

The test suite contains 32 comprehensive tests covering token validation, word counting, chunking, and mocked API responses:

```powershell
cd "d:\Text summarizing\text-summarizer"
.venv\Scripts\activate
python -m pytest tests/ -v
```

Expected output:
```text
======================== 32 passed in 1.17s ========================
```

---

## 🛠️ API Endpoints (`api.py`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Verifies server and API health status |
| `POST` | `/api/summarize` | Summarizes text, returns reduction stats and word counts |

**Example Request:**
```json
POST /api/summarize
Content-Type: application/json

{
  "text": "Artificial intelligence is transforming industries across the globe..."
}
```

**Example Response:**
```json
{
  "summary": "AI is reshaping industries like healthcare and finance...",
  "stats": {
    "originalWords": 284,
    "originalChars": 1920,
    "summaryWords": 78,
    "summaryChars": 512,
    "reductionPercent": 72.5
  }
}
```

---

## 🛡️ Security Best Practices

- `GEMINI_API_KEY` is loaded through `.env` on the backend only.
- The React frontend communicates strictly with `/api/summarize` without knowing or handling the secret key.
- `.env` is explicitly ignored in `.gitignore` to prevent leakage into version control.

---

## 🎓 College Project & Interview Highlights

- **Clean Layered Architecture**: Clear separation of UI (React/Streamlit), REST API (Flask), and core business logic (`summarizer.py`).
- **Resilience**: Gracefully handles network dropouts, rate limits, quota exhaustion, and oversized inputs.
- **Chunking Pipeline**: Handles texts exceeding single-prompt thresholds through split-summarize-merge logic.
- **Accessibility & UX**: Includes integrated Web Speech API narration, live word count validation, and dual light/dark themes.
