import os
import json
import faiss
import numpy as np
import pickle
import sys
from sentence_transformers import SentenceTransformer

# Set up imports from the 'app' module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.config import settings
from app.services.data_processor import preprocess

def run_indexing():
    """Generates the FAISS vector store by processing the data directory."""
    print("=" * 50)
    print("Starting Vector Indexing (ETL) Pipeline")
    print("=" * 50)

    if not os.path.exists(settings.DATA_DIR):
        print(f"ERROR: Data directory not found -> {settings.DATA_DIR}")
        return

    # Ensure output DB dir exists
    if not os.path.exists(settings.FAISS_DB_DIR):
        os.makedirs(settings.FAISS_DB_DIR, exist_ok=True)
        print(f"Created database directory: {settings.FAISS_DB_DIR}")

    print(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME} (this may take a moment if not cached)...")
    model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
    dimension = model.get_embedding_dimension()

    all_docs = []
    texts_to_embed = []
    
    print(f"\nScanning for JSON files in: {settings.DATA_DIR}")
    files_processed = 0

    for root, dirs, files in os.walk(settings.DATA_DIR):
        for file in files:
            if file.endswith(".json"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        processed = preprocess(data)
                        all_docs.append(processed)
                        texts_to_embed.append(processed["embedding_text"])
                        files_processed += 1
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    if not texts_to_embed:
        print("\nNo valid documents found. Aborting indexing.")
        return

    print(f"\nSuccessfully read {files_processed} files.")
    print("Generating embeddings... This might take a while depending on data size.")
    
    embeddings = model.encode(texts_to_embed, show_progress_bar=True)
    embeddings = np.array(embeddings).astype('float32')

    print("\nInitializing FAISS Index...")
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    print(f"Index created. Total vectors added: {index.ntotal}")

    # Save to disk
    faiss.write_index(index, settings.FAISS_INDEX_PATH)
    with open(settings.FAISS_METADATA_PATH, "wb") as f:
        pickle.dump(all_docs, f)

    print("\n" + "=" * 50)
    print("Indexing Complete!")
    print(f"Saved Vector DB to -----------> {settings.FAISS_INDEX_PATH}")
    print(f"Saved Metadata to   -----------> {settings.FAISS_METADATA_PATH}")
    print("The API is now ready for sub-millisecond retrieval.")
    print("=" * 50)

if __name__ == "__main__":
    run_indexing()
