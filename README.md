# PlacementRAG 🎓

> An AI-powered placement assistant for **University of Delhi – Faculty of Technology** students. Ask questions, explore roles, and navigate your campus placement journey — powered by a RAG pipeline on a curated FAISS vector database.

---

## ✨ Features

- 🤖 **AI Chat Assistant** — Ask natural language questions about companies, roles, packages, and selection processes. Powered by **Gemini 2.5 Flash** via the `google-genai` SDK.
- 🔍 **Semantic Role Search** — Type anything ("React intern", "10+ LPA", "non-DSA roles") and get vector-similarity matches from **80+ real company role profiles**.
- 📋 **Detailed Role Popup** — Click any role card to see a full breakdown: salary, eligibility criteria, required skills, and step-by-step selection process.
- 💎 **Glassmorphism UI** — Frosted glass panels, ambient purple-to-blue gradient background, and Poppins typography for a premium look.
- 📱 **Fully Responsive** — Off-canvas sidebar on mobile with `100dvh` layout for consistent rendering across devices.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion |
| **Backend** | FastAPI, Python 3.12, Uvicorn |
| **Vector DB** | FAISS (local persistent index) |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` |
| **LLM** | Google Gemini 2.5 Flash (`google-genai`) |
| **Auth** | NextAuth.js (Google OAuth) |

---

## 📁 Project Structure

```
sem_6_project/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/               # Config & settings
│   │   ├── routes/             # API endpoints (ask, search)
│   │   └── services/           # RAG service, FAISS retriever
│   ├── tests/                  # Unit + Integration tests
│   ├── index_data.py           # Script to build the FAISS vector DB
│   ├── faiss_index.bin         # Built vector index (git-ignored)
│   └── metadata.pkl            # Document metadata store (git-ignored)
│
├── frontend/                   # Next.js 15 app
│   ├── app/                    # App router pages & layout
│   ├── components/             # ChatMode, SearchMode, AuthLogin
│   └── public/                 # Static assets (DU logo, etc.)
│
└── Companies_data/             # Raw JSON role data (80+ profiles)
    ├── Amazon/
    ├── Google/
    ├── Flipkart/
    └── ...
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** v18+ and **npm**
- **Python** 3.12+
- A **Google Gemini API key** → [Get one here](https://aistudio.google.com/app/apikey)
- A **Google OAuth Client ID/Secret** → [Google Console](https://console.cloud.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sem_6_project.git
cd sem_6_project
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate          # Linux/macOS
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

Create your environment file:

```bash
# Create backend/.env (DO NOT commit this)
GEMINI_API_KEY=your_gemini_api_key_here
```

Build the FAISS vector database from the company JSON files:

```bash
python3 index_data.py
```

> **This only needs to be run once**, or whenever you add new company JSON files to `Companies_data/`.

Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`.  
Interactive docs at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Create your environment file:

```bash
# Create frontend/.env.local (DO NOT commit this)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_strong_secret_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

### 4. Running Tests (Backend)

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ask/` | Ask the AI assistant a question |
| `GET` | `/search/` | Vector search for roles (optional `?query=`) |
| `GET` | `/search/{role_id}` | Get full details of a specific role |

### Example: Ask the AI

```bash
curl -X POST http://127.0.0.1:8000/ask/ \
  -H "Content-Type: application/json" \
  -d '{"query": "What companies hire for SDE roles above 20 LPA?"}'
```

### Example: Search Roles

```bash
curl "http://127.0.0.1:8000/search/?query=machine+learning+intern"
```

---

## ➕ Adding New Company Data

1. Create a new JSON file in `Companies_data/<CompanyName>/` following the existing schema.
2. Re-run the indexer:
   ```bash
   cd backend
   source venv/bin/activate
   python3 index_data.py
   ```
3. Restart the backend server.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT

---

<div align="center">
  Built with ❤️ by <strong>Faculty of Technology, University of Delhi</strong>
</div>
