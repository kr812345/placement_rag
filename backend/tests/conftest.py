import pytest
from fastapi.testclient import TestClient
from app.main import app
import os
import sys

# Ensure tests can import app modules directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture(scope="module")
def client():
    """Returns a FastAPI TestClient instance."""
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def mock_env_vars(monkeypatch):
    """Mocks environment variables to avoid accidental live DB or API calls during tests."""
    monkeypatch.setenv("GEMINI_API_KEY", "dummy_key_for_testing")
    monkeypatch.setenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
