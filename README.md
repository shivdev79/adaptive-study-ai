# StudyMind AI — Adaptive AI-Powered Learning Platform

**StudyMind AI** is a production-quality, end-to-end adaptive study assistant that transforms raw course materials (PDFs, notes, textbooks, previous year exam papers) into a personalized learning system.

It features grounded Retrieval-Augmented Generation (RAG), multi-mode AI tutoring (including Socratic mode), dynamic diagnostic & adaptive quiz generation, semantic answer evaluation, explainable student mastery tracking (0–100 score), mistake memory, PYQ frequency analysis, automated study planning (including 2-Hour Crash Mode), spaced repetition (SuperMemo SM-2), interactive knowledge graphs, special numerical/coding solvers, and teacher analytics.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Custom Glassmorphism SaaS aesthetics
- **UI Icons**: Lucide React
- **Data Visualization**: Recharts
- **Voice Support**: HTML5 Web Speech API (Speech-to-Text & Text-to-Speech)

### Backend
- **Framework**: Python 3.11+, FastAPI
- **Database**: PostgreSQL (SQLAlchemy ORM with automatic SQLite fallback for standalone local execution)
- **Authentication**: JWT authentication with SHA-256 HMAC & password hashing
- **Data Validation**: Pydantic v2
- **Testing**: pytest

### AI / RAG Pipeline
- **Provider Layer**: Configurable abstraction supporting OpenAI API (GPT-4o / GPT-4o-mini), HuggingFace, or Local Mock Engine
- **RAG Architecture**: Hybrid BM25 Keyword Search + Vector Cosine Similarity
- **Document Ingestion**: Extract text from PDF (`pypdf`), DOCX (`python-docx`), PPTX (`python-pptx`), and TXT with structure & section heading detection

---

## Directory Structure

```
.
├── backend/
│   ├── app/
│   │   ├── ai/                      # LLM Abstraction, Embeddings, RAG & Prompts
│   │   │   ├── prompts/             # Centralized Prompt Templates
│   │   │   ├── embedding_service.py # Vector embedding calculator
│   │   │   ├── llm_provider.py      # OpenAI & Local Mock Engine
│   │   │   └── rag_service.py       # Hybrid BM25 + Vector RAG
│   │   ├── api/
│   │   │   └── routers/             # REST Routers (Auth, Courses, Tutor, Quiz, etc.)
│   │   ├── core/                    # Security, Config & JWT
│   │   ├── database/                # SQLAlchemy session & Base engine
│   │   ├── models/                  # Database Entities (User, Course, Quiz, Flashcard, etc.)
│   │   ├── schemas/                 # Pydantic Request & Response schemas
│   │   ├── services/                # Business logic (Mastery, Planner, Ingestion, SM-2)
│   │   └── main.py                  # FastAPI Application Entrypoint
│   ├── tests/                       # Pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js App Router Pages (Dashboard, Tutor, Quiz, etc.)
│   │   ├── components/layout/       # Navbar, Sidebar layout components
│   │   └── lib/api.ts               # Axios API client wrapper with JWT interceptor
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml               # Multi-container orchestration (Postgres, Backend, Frontend)
├── .env.example                     # Environment Configuration Template
└── README.md
```

---

## Key Features

1. **Grounded RAG AI Tutor**: Answers student questions strictly based on uploaded course documents with page & section source citations. Supports 6 Tutor Modes: *Exam Mode, Beginner Mode, Socratic Mode, Deep Learning, Interview Mode, Quick Revision*.
2. **Adaptive Quiz Engine**: Generates grounded MCQs, short answers, and numerical questions. Evaluates student answers semantically, providing correctness scores, missing concepts, model answers, and improvement suggestions.
3. **Explainable Student Mastery Engine**: Calculates an explainable score between 0 and 100 based on accuracy, question difficulty, recency decay, and repeated mistakes.
4. **Mistake Vault**: Stores every incorrect response with question, student response, correct model answer, and resolution status.
5. **Personalized Study Planner & 2-Hour Crash Mode**: Generates schedules dynamically. Includes a "Crash Mode" button ("I have 2 hours") prioritizing weak concepts, high-frequency PYQs, and revision.
6. **Spaced Repetition Flashcards**: SuperMemo SM-2 algorithm scheduler with "Again / Hard / Good / Easy" ratings.
7. **PYQ Frequency Analyzer**: Analyzes historical exam papers and displays topic appearance frequencies.
8. **Interactive Knowledge Graph**: Visual node-link concept explorer color-coded by mastery score.
9. **Numerical & Coding Solvers**: Step-by-step numerical problem solver ("Teach Me" mode) and code debugger/complexity analyzer.
10. **Teacher Dashboard**: Aggregated class metrics, class weak concepts, and managed course overviews.

---

## Quick Start (Local Setup)

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*The FastAPI backend will launch on `http://localhost:8000` with auto-created SQLite database `studymind.db` and seed demo data loaded for "Machine Learning (CS229)".*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The Next.js frontend will launch on `http://localhost:3000`.*

---

## Running with Docker Compose

To launch the complete application stack (PostgreSQL database, FastAPI backend, Next.js frontend):

```bash
docker compose up --build
```

Access services:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Interactive API Docs (Swagger UI)**: `http://localhost:8000/docs`

---

## Running Automated Tests

Run the backend pytest suite:
```bash
cd backend
python -m pytest -v
```

---

## Demo Credentials
- **Student User**: `student@studymind.ai` / `password123`
- **Teacher User**: `teacher@studymind.ai` / `password123`
