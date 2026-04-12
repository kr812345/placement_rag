from google import genai
from typing import List, Dict, Any
from app.services.retriever import search_documents
from app.core.config import settings

# Initialize Gemini Client
client = None
if settings.GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini Client: {e}")
else:
    print("Warning: GEMINI_API_KEY not found in settings.")

async def call_gemini(prompt: str) -> str:
    """Helper to call Gemini API."""
    if not client:
        return "I'm sorry, but my AI brain is currently disconnected (API key missing). However, I have retrieved the relevant placement data for you."

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return f"I encountered an error while processing your request: {str(e)}"

async def get_rag_response(query: str):
    """
    Main orchestrator for the RAG flow.
    1. Retrieve relevant company/role documents.
    2. Construct a professional prompt for the Career Counselor persona.
    3. Call Gemini to generate the final answer.
    """
    # Step 1: Retrieve documents
    relevant_docs = await search_documents(query, top_k=5)
    
    if not relevant_docs:
        return (
            "Hello! As your career counselor, I've searched through our current placement records but couldn't "
            "find specific details related to your query. Could you please provide more context or maybe "
            "ask about a different company or role?"
        )

    # Step 2: Construct Context
    context_text = ""
    for i, doc in enumerate(relevant_docs):
        context_text += f"\n--- Document {i+1} ---\n{doc['content']}\n"
    
    # Step 3: Prompt Construction (Career Counselor Persona)
    system_prompt = (
        "You are a professional Career Counselor at a top technical university. "
        "Your goal is to help students with placement-related queries using ONLY the provided context. "
        "Be encouraging, professional, and clear. Format your response with structured sections and bold text for readability. "
        "If the context doesn't fully answer the question, state what is known and offer general career advice based on the context."
    )
    
    full_prompt = (
        f"{system_prompt}\n\n"
        f"Context from placement records:\n{context_text}\n\n"
        f"Student Query: {query}\n\n"
        f"Counselor's Response:"
    )
    
    # Step 4: Call LLM
    answer = await call_gemini(full_prompt)
    
    return answer