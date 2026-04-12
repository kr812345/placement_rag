from fastapi import APIRouter
from app.models.schemas import QueryRequest
from app.services.rag_service import get_rag_response

router = APIRouter()

@router.post("/")
async def ask_question(request: QueryRequest):
    response = await get_rag_response(request.query)
    return {"answer": response}