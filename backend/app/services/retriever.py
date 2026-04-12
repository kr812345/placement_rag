import os
import faiss
import numpy as np
import pickle
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from app.core.config import settings

class PlacementRetriever:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PlacementRetriever, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        print(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}...")
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        self.dimension = self.model.get_embedding_dimension()
        
        self.index = None
        self.documents = [] 
        self._initialized = True

    def load_db(self) -> bool:
        """Loads the pre-built FAISS index and metadata from disk."""
        if not os.path.exists(settings.FAISS_INDEX_PATH) or not os.path.exists(settings.FAISS_METADATA_PATH):
            print(f"WARNING: FAISS DB files not found in {settings.FAISS_DB_DIR}.")
            print("Please run 'python index_data.py' to generate the vector database first.")
            return False
            
        try:
            print("Loading Vector DB from disk...")
            self.index = faiss.read_index(settings.FAISS_INDEX_PATH)
            with open(settings.FAISS_METADATA_PATH, "rb") as f:
                self.documents = pickle.load(f)
            print("Vector DB loaded successfully.")
            return True
        except Exception as e:
            print(f"Error loading Vector DB: {e}")
            return False

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for top_k documents similar to the query."""
        if self.index is None:
            success = self.load_db()
            if not success:
                return []
            
        if self.index is None or self.index.ntotal == 0:
            return []

        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding).astype('float32'), top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.documents):
                doc = self.documents[idx]
                results.append({
                    "score": float(distances[0][i]),
                    "content": doc["embedding_text"],
                    "metadata": doc["metadata"]
                })
        
        return results

# Singleton instance
retriever_instance = PlacementRetriever()

async def search_documents(query: str, top_k: int = 5):
    """Wrapper for the PlacementRetriever search method."""
    return retriever_instance.search(query, top_k=top_k)