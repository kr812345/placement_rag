import pytest
from unittest.mock import patch, AsyncMock

def test_root_endpoint(client):
    """Test the base health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API is running"}

def test_search_endpoint(client):
    """Test the basic search health endpoint."""
    response = client.get("/search/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@patch("app.routes.ask.get_rag_response", new_callable=AsyncMock)
def test_ask_endpoint(mock_get_rag_response, client):
    """Test the /ask endpoint to ensure it correctly maps request bodies and routes to the service."""
    # Arrange
    mock_get_rag_response.return_value = "This is a test response securely passing through the endpoints."
    
    # Act
    payload = {"query": "Tell me about Google"}
    response = client.post("/ask/", json=payload)
    
    # Assert
    assert response.status_code == 200
    assert response.json()["answer"] == "This is a test response securely passing through the endpoints."
    mock_get_rag_response.assert_called_once_with("Tell me about Google")

def test_ask_endpoint_validation_error(client):
    """Ensure improper payloads return a 422 Unprocessable Entity."""
    # Missing 'query' key
    payload = {"wrong_key": "Tell me about Google"}
    response = client.post("/ask/", json=payload)
    assert response.status_code == 422
