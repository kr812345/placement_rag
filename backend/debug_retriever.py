import asyncio
from app.services.retriever import search_documents

async def main():
    docs = await search_documents("software development intern")
    print(f"Total returned docs: {len(docs)}")
    for doc in docs:
        print(doc["content"][:50])

if __name__ == "__main__":
    asyncio.run(main())
