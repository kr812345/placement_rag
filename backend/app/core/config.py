import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Placement RAG API"
    
    # Embedding Model Settings
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    
    # Data Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.normpath(os.path.join(BASE_DIR, "..", "Companies_data"))
    FAISS_DB_DIR: str = os.path.join(BASE_DIR, "app", "db")
    FAISS_INDEX_PATH: str = os.path.join(FAISS_DB_DIR, "faiss_index.bin")
    FAISS_METADATA_PATH: str = os.path.join(FAISS_DB_DIR, "metadata.pkl")
    
    # LLM Settings (Placeholders for now)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # Defaulting to gemini or openai
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
