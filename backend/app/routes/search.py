from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.retriever import retriever_instance

router = APIRouter()

def format_role(doc: dict, score: float = None) -> dict:
    """Helper to convert raw document metadata to the frontend UI format."""
    meta = doc.get("metadata", {})
    role = meta.get("role", {})
    company = meta.get("company", {})
    
    # Simple score mapping: Assuming L2 distance, lower is better.
    # We invert it for a mock percentage (e.g., 0 distance = 100%, 1.0 distance = 90%)
    match_percentage = "100%"
    if score is not None:
        raw_match = max(0, 100 - int(score * 10))
        match_percentage = f"{raw_match}%"

    return {
        "id": meta.get("role_id", "unknown_id"),
        "title": role.get("title", "Unknown Role"),
        "company": company.get("name", "Unknown Company"),
        "type": role.get("type", "Full-Time"),
        "location": (role.get("location") or ["Remote"])[0],
        "match": match_percentage
    }

@router.get("/")
async def explore_roles(query: Optional[str] = Query(None, description="Search term")):
    # Lazy load if needed
    if retriever_instance.index is None:
        retriever_instance.load_db()

    results = []
    
    if not query or not query.strip():
        # Return top 500 roles to ensure autocomplete list is comprehensive
        docs = retriever_instance.documents[:500]
        for doc in docs:
            results.append(format_role(doc))
        return results

    # Perform vector search
    try:
        search_results = retriever_instance.search(query, top_k=20)
        for res in search_results:
            results.append(format_role(res, res["score"]))
    except Exception as e:
        print(f"Error executing search: {e}")
        
    return results

from fastapi import HTTPException

@router.get("/{role_id}")
async def get_role_details(role_id: str):
    """Retrieve full details of a role from FAISS metadata."""
    if retriever_instance.index is None:
        retriever_instance.load_db()

    for doc in retriever_instance.documents:
        meta = doc.get("metadata", {})
        if meta.get("role_id") == role_id:
            return meta

    raise HTTPException(status_code=404, detail="Role not found")
