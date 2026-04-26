# PlacementRAG: Project Overview & Workflow

> **PlacementRAG** is an AI-powered placement assistant tailored for University of Delhi (Faculty of Technology) students. It features an interactive RAG (Retrieval-Augmented Generation) pipeline that lets students ask questions about companies and explore over 80+ real role profiles and their selection processes using semantic search.

---

## 🏗 Tech Stack Overview

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend:** FastAPI, Python 3.12, Uvicorn
- **AI & ML:** Google Gemini 2.5 Flash (via `google-genai`), Sentence Transformers (`all-MiniLM-L6-v2`)
- **Vector Database:** FAISS (Local persistent index)
- **Authentication:** NextAuth.js (Google OAuth)

---

## ⚙️ Detailed Workflow & Architecture

The application operates across three primary workflows: the offline data ingestion process, the online search mechanism, and the online AI chat process.

### 1. Data Ingestion & Indexing Pipeline (Offline)
This process builds the foundation of the RAG system by converting raw JSON files into a searchable vector database.

1. **Raw Data:** Over 80+ company role profiles (stored in `Companies_data/` as JSON files).
2. **Preprocessing:** The `index_data.py` script reads the JSON data and applies a custom preprocessing function to format text specifically for embeddings.
3. **Embedding Generation:** It uses the `sentence-transformers/all-MiniLM-L6-v2` model to convert the text into dense mathematical vectors (embeddings).
4. **FAISS Indexing:** The embeddings are loaded into a FAISS local index (`faiss_index.bin`), while the original documents' metadata is stored in a pickle file (`metadata.pkl`).
5. **Result:** Sub-millisecond vector similarity search capabilities across all company documents.

### 2. AI Chat Assistant Workflow (Online)
This pipeline uses Gemini alongside the FAISS index to answer natural language queries accurately.

1. **User Prompt:** The user types a natural language question (e.g., "What companies hire for SDE roles above 20 LPA?") in the Next.js `ChatMode` interface.
2. **API Request:** The query is sent via a `POST` request to the backend `/ask/` endpoint.
3. **RAG Service (`rag_service.py`):**
   - The user query is vectorized using the same Sentence Transformer model.
   - The query vector retrieves the top `K` most relevant company contexts from the FAISS database.
   - A structured prompt containing both the user's query and the retrieved context is formed.
4. **LLM Generation:** The constructed prompt is sent to **Gemini 2.5 Flash**.
5. **Response Delivery:** The response is returned to the frontend and elegantly presented to the user.

### 3. Semantic Role Search Workflow (Online)
This feature allows users to semantically search for specific job roles based on custom filters and natural language tags.

1. **User Search:** The user types queries like "React intern" or "10+ LPA" into the Next.js `SearchMode` interface.
2. **API Request:** A `GET` request is sent to the backend `/search/?query=...` endpoint.
3. **Vector Retrieval (`retriever.py`):**
   - The backend converts the search string into an embedding vector.
   - FAISS calculates the L2 distance between the query vector and the document vectors.
   - The most semantically similar documents are retrieved.
4. **Data Formatting:** The matched records (including their match percentage/score based on L2 distance) are mapped to a UI-friendly dictionary schema.
5. **UI Rendering:** The Next.js frontend renders glassmorphism cards for each result. Clicking a card fetches its full profile via `/search/{role_id}`.

---

## 📁 Component Breakdown

### Backend (`/backend`)
- **`main.py`:** Initializes the FastAPI app, integrates CORS, and maps the `/ask` and `/search` routers.
- **`app/routes/ask.py`:** Handles AI chat requests.
- **`app/routes/search.py`:** Handles semantic queries and role detail lookups.
- **`app/services/`:** Contains core business logic (RAG query formatting, FAISS retrieval layer, document processing).
- **`index_data.py`:** The primary ETL pipeline script for managing updates to company data.

### Frontend (`/frontend`)
- **`app/page.tsx`:** The root layout utilizing a sidebar navigation to switch between the "Chat" and "Search" workspaces. Features mobile responsiveness and frosted glass styling.
- **`components/`:**
  - **`ChatMode`**: Implements the user-facing interface for interacting with the AI Assistant.
  - **`SearchMode`**: Implements the user-facing interface for searching and browsing role cards.
  - **`AuthLogin`**: Secures access via Google NextAuth integration.

---

> [!TIP]
> **Updating the Database:** Whenever new JSON role files are added to `Companies_data/`, simply re-run `python3 index_data.py` in the backend environment to update the `faiss_index.bin` and keep the semantic search up-to-date.
