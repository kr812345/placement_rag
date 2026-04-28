from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ask, search, applications, webhooks, ai
from app.db.database import engine
from app.db import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Placement RAG API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ask.router, prefix="/ask", tags=["Ask"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])

@app.get("/")
def root():
    return {"message": "API is running"}