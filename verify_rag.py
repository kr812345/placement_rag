import asyncio
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.services.rag_service import get_rag_response

async def main():
    print("Testing RAG Response...")
    query = "What are the roles at Google for 2025 graduates?"
    print(f"Query: {query}")
    
    response = await get_rag_response(query)
    print("\nResponse:")
    print(response)

if __name__ == "__main__":
    asyncio.run(main())
