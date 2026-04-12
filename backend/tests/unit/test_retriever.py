import pytest
import numpy as np
import faiss
from unittest.mock import patch, MagicMock
from app.services.retriever import retriever_instance

@pytest.fixture
def mock_faiss_index():
    """Returns a mock FAISS index."""
    mock_index = MagicMock()
    # ntotal is used to check if the index is populated
    mock_index.ntotal = 5
    
    # search returns (distances, indices)
    # Mocking a search returning 2 results
    mock_index.search.return_value = (
        np.array([[0.1, 0.5]]), # distances
        np.array([[0, 1]])      # indices
    )
    return mock_index

def test_retriever_initialization():
    assert retriever_instance._initialized is True
    assert retriever_instance.index is None
    assert retriever_instance.documents == []

@patch("app.services.retriever.os.path.exists", return_value=False)
def test_retriever_db_not_found(mock_exists):
    """Ensure it handles a missing database file gracefully."""
    success = retriever_instance.load_db()
    assert success is False
    
    # Searching with no db should return empty list
    results = retriever_instance.search("test")
    assert results == []

def test_retriever_search_with_mock(mock_faiss_index):
    """Test retrieval logic using a mocked FAISS index and mock documents."""
    retriever_instance.index = mock_faiss_index
    retriever_instance.documents = [
        {"embedding_text": "doc0", "metadata": {"id": 0}},
        {"embedding_text": "doc1", "metadata": {"id": 1}},
        {"embedding_text": "doc2", "metadata": {"id": 2}},
    ]
    
    # Act
    results = retriever_instance.search("google software engineer")
    
    # Assert
    assert len(results) == 2
    assert results[0]["content"] == "doc0"
    assert results[1]["content"] == "doc1"
    
    # reset state for other tests
    retriever_instance.index = None
    retriever_instance.documents = []
