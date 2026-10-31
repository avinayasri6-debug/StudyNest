# 🌿 StudyNest — Academic Workspace & Engineering Learning Platform

[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Pyodide_0.26-654FF0?style=flat-square&logo=webassembly&logoColor=white)](https://pyodide.org/)
[![License](https://img.shields.io/badge/License-MIT-2D6A4F?style=flat-square)](LICENSE)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel_Ready-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

> **StudyNest** is a calm, minimalist academic operating system designed for first-year engineering students (Computer Science & Engineering – Artificial Intelligence & Machine Learning). It consolidates seven Semester 1 foundational courses, an in-browser WebAssembly Python IDE, an intelligent AI tutor, video learning, mock tests, smart notes, and schedule planning into a unified, distraction-free desktop and mobile workspace.

---

## 📸 Screenshots & UI Walkthrough

| Academic Dashboard | In-Browser Python IDE (WebAssembly) |
|:---:|:---:|
| ![StudyNest Dashboard](docs/screenshots/dashboard.png) | ![Python Practice Lab](docs/screenshots/python-lab.png) |
| *Personalized academic progress, exam countdowns, daily streaks, and quick study targets.* | *Live WebAssembly Python execution via Pyodide with real-time test cases & console.* |

| AI Study Assistant & Socratic Tutor | Video Learning Hub & Curated Lectures |
|:---:|:---:|
| ![AI Study Assistant](docs/screenshots/ai-tutor.png) | ![Video Learning Hub](docs/screenshots/video-hub.png) |
| *Context-aware pedagogical AI with LaTeX math formulas, code blocks, and 4 tutoring modes.* | *Curated verified lectures from 3Blue1Brown, MIT OCW, and freeCodeCamp with progress tracking.* |

*(Place your UI screenshots in `docs/screenshots/` to display them here.)*

---

## ✨ Core Features

### 1. 📊 Central Academic Dashboard
- **Daily Streak & Target Pacing**: Visual indicators tracking continuous learning days and study goals.
- **Semester 1 Course Progress**: Interactive circular progress rings and unit completion tracking across all 7 courses.
- **Upcoming Examination Countdown**: Synchronized countdown clocks for Mid-Term and End-Semester exams.
- **Academic Focus Notes**: Quick-access shelf for frequently revised or pinned notes.

### 2. 🤖 AI Study Assistant (Private Server-Side Proxy)
- **Pedagogical Socratic Guidance**: Helps students derive solutions conceptually rather than just copying answers.
- **4 Pedagogical Modes**:
  - *Socratic Inquiry*: Step-by-step guided questions.
  - *Intuitive Analogy*: Everyday physical analogies for complex concepts.
  - *Rigorous Mathematical*: Formal proofs and derived equations.
  - *Exam Cram & Revision*: Rapid formula summaries and high-yield question patterns.
- **LaTeX Math & Syntax Highlighting**: Clean rendering of mathematical formulas ($Ax = \lambda x$) and formatted code blocks.
- **Zero Client-Side Key Exposure**: API calls are routed through server-side connect middleware / Vercel serverless functions.
- **Instant Demo Mode**: Automatically provides pre-formulated engineering explanations if no external API key is configured.

### 3. 📝 AI Notes Generator & Smart Revision
- **Subject-Specific Formulations**: Tailored to all 7 Semester 1 engineering syllabi.
- **Customizable Depth**: Choose between Foundational, Intermediate, or Advanced academic depth, as well as Short, Standard, or Comprehensive note lengths.
- **Interactive Revision Tools**: One-click summary generation, flashcard creation, mock quiz questions, and clean printable PDF export.

### 4. 🐍 Python Academy & WebAssembly IDE
- **Zero-Installation Code Execution**: Runs authentic Python 3.12 inside the browser using Pyodide (WebAssembly in a Dedicated Web Worker).
- **20 Graded Practice Exercises**: Beginner, Intermediate, and Advanced challenges with automated test evaluation and immediate pass/fail feedback.
- **15 Curriculum Modules**: Interactive theory, syntax breakdowns, copy-to-editor snippets, and concept checks covering loops, data structures, recursion, and algorithm efficiency.
- **Built-in Editor Controls**: Custom themes, line numbers, execution time benchmarking, reset boilerplate, and run controls (`Ctrl+Enter`).

### 5. 🎥 Video Learning Hub
- **Curated Educational Lectures**: 26+ verified academic videos from world-class educators (3Blue1Brown, MIT OpenCourseWare, freeCodeCamp, Veritasium, and NPTEL).
- **Responsive 16:9 Video Player**: Embedded YouTube player with theater-like viewing and zero distraction.
- **Watch Later Queue & Progress Tracking**: Automatically marks watched videos, updates subject video completion percentages, and maintains recent viewing history.
- **AI Video Learning Path**: Analyzes completed lectures to recommend next steps and interleaved practice sessions.

### 6. 🏆 Exam Preparation & Mock Test Centre
- **Subject-Wise Question Bank**: 200+ high-yield conceptual questions, numerical problems, and previous examination patterns.
- **Custom Timed Mock Test Engine**: Select subjects, question count, and duration (15m, 30m, 45m, 60m).
- **Sticky Countdown Timer**: Timer and question palette remain pinned at the top on both mobile and desktop viewports.
- **Detailed Performance Analytics**: Score percentages, correct answer breakdowns, topic review recommendations, and local score history.

### 7. 📅 Smart Study Planner & Pomodoro Timer
- **Daily Chronological Scheduler**: Add and prioritize study sessions, homework, and assignment deliverables.
- **7-Day Interactive Weekly Calendar**: Touch-scrollable calendar with drag-free date selection and exam milestones.
- **Pomodoro Focus Timer**: Customizable work/break intervals (25m / 5m) with visual circular progress and focus streak counters.

### 8. 📓 Smart Notes & Digital Notebook
- **Multi-Subject Categorization**: Folder organization for each Semester 1 course plus custom user folders.
- **Rich-Text Formatting Toolbar**: Bold, italics, code blocks, lists, markdown tables, and live preview.
- **Organization Tools**: Custom tags, pin to top, favorite marking, search by content, and sorting.
- **Clean Print & PDF Export**: Printer-optimized CSS for clean one-page review sheets without web chrome.

### 9. 📈 Progress Analytics Dashboard
- **7 Comprehensive KPI Cards**: Real-time metrics on completed topics, study hours, video lectures watched, mock tests passed, and active tasks.
- **Subject Mastery Matrix**: Visual progress bars and completion percentages for every course.
- **Target Comparison**: Tracks daily and weekly targets against actual logged sessions.

---

## 🛠️ Technologies Used

- **Frontend Core**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Code Execution**: [Pyodide 0.26](https://pyodide.org/) (Python WebAssembly in Web Workers)
- **Syntax Highlighting**: [PrismJS](https://prismjs.com/)
- **Styling**: Vanilla Modern CSS (CSS Custom Properties, Fluid Grids, Responsive Flexbox, Mobile Viewport Fit)
- **State & Storage**: Centralized `localStorage` management with versioned schema keys (`src/services/storage.js`)
- **Backend & Middleware**:
  - Node.js native connect middleware (`server/aiPlugin.js`) for local development
  - Optional standalone Node server (`server/standalone.js`)
  - Serverless API functions (`api/ai/*.js`) for Vercel deployment
- **AI Integrations**: Google Gemini API (`gemini-3.8-flash`), OpenAI API (`gpt-4o-mini`), or Zero-Config Local Pedagogical Demo Engine

---

## 📂 Project Architecture

```
StudyNest/
├── api/                           # Vercel Serverless Functions
│   └── ai/
│       ├── chat.js                # POST /api/ai/chat
│       ├── generate-notes.js      # POST /api/ai/generate-notes
│       ├── revision-tool.js       # POST /api/ai/revision-tool
│       └── status.js              # GET /api/ai/status
├── public/                        # Static assets (Favicons, Pyodide Worker)
│   ├── favicon.svg
│   ├── icons.svg
│   └── pyodideWorker.js
├── server/                        # Server-side AI logic & Dev middleware
│   ├── aiPlugin.js                # Vite connect middleware plugin
│   ├── aiService.js               # Core Gemini/OpenAI API handler & Fallbacks
│   └── standalone.js              # Optional independent Node.js server
├── src/
│   ├── components/                # Reusable UI widgets, Navbars, Drawers & Modals
│   ├── data/                      # Academic syllabi, practice questions & videos
│   ├── services/                  # Pyodide runner & LocalStorage managers
│   ├── views/                     # 10 Major feature pages
│   ├── App.css                    # Unified 3-tier responsive styling
│   ├── App.jsx                    # Root layout, persistent state & view switching
│   ├── index.css                  # Modern reset, CSS variables & typography
│   └── main.jsx                   # React entry point with ErrorBoundary
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules for node_modules, keys, & dist
├── package.json                   # Project metadata and dependencies
├── vercel.json                    # Vercel deployment configuration & routing
└── vite.config.js                 # Vite build settings & manual chunk splitting
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
- [npm](https://www.npmjs.com/) (version 9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/StudyNest.git
cd StudyNest
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional for Live AI)
StudyNest includes a **built-in pedagogical demo engine**, so it runs completely without an API key. 

To enable live Google Gemini AI responses:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux:
cp .env.example .env
```
Open `.env` in any text editor and paste your free key from [Google AI Studio](https://aistudio.google.com/):
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
AI_PROVIDER=gemini
```

### 4. Start the Local Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### 5. Verify the Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Online Deployment Guide

### Deploying to Vercel (Recommended)

StudyNest is pre-configured with [`vercel.json`](vercel.json) and [`api/`](api/) serverless functions for seamless Vercel deployment.

1. **Push your repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: StudyNest Academic Workspace"
   git branch -M main
   git remote add origin https://github.com/your-username/StudyNest.git
   git push -u origin main
   ```
2. **Import to Vercel**:
   - Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
   - Select your `StudyNest` GitHub repository.
   - Framework Preset: **Vite** (auto-detected).
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set Environment Variables in Vercel**:
   - In the project settings, add:
     - `GEMINI_API_KEY` = `your_gemini_api_key`
     - `GEMINI_MODEL` = `gemini-3.8-flash`
     - `AI_PROVIDER` = `gemini`
4. Click **Deploy**. Your application will be live at `https://your-project.vercel.app` with both the frontend and serverless AI API working!

---

## 🔒 Security & Privacy Practices

- **Zero Client-Side Secrets**: API keys are strictly accessed within Node.js middleware or serverless functions. No keys are ever bundled into the client JavaScript build.
- **Protected Environment Files**: `.gitignore` strictly prohibits committing `.env`, `.env.local`, or any private credentials.
- **Client-Side Data Privacy**: All student data (notes, progress, test scores, study targets) is stored locally on the user's browser via `localStorage`. No user study data is transmitted to external servers.
- **Sandboxed Execution**: Python code runs client-side in a Web Worker using WebAssembly, ensuring it cannot access the DOM or local system files.

---

## 🔮 Future Improvements & Roadmap

- [ ] **Multi-Semester Expansion**: Pre-populated course syllabi for Semesters 2 through 8.
- [ ] **Spaced Repetition Flashcards**: Anki-style SM-2 algorithm for automated daily flashcard reviews.
- [ ] **Collaborative Study Rooms**: Peer-to-peer WebRTC study lobbies with shared Pomodoro timers.
- [ ] **Cloud Sync (Optional)**: Opt-in end-to-end encrypted backup to Google Drive or Supabase.
- [ ] **Audio Lecture Transcriptions**: In-browser speech-to-text for recorded university lectures.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for academic or personal learning purposes.

---

<div align="center">
  <sub>Built with care for engineering students. Calm, focused, and purposeful learning.</sub>
</div>
