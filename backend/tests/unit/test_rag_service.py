import pytest
from unittest.mock import patch, AsyncMock
from app.services.rag_service import get_rag_response

@pytest.mark.asyncio
@patch("app.services.rag_service.search_documents", new_callable=AsyncMock)
@patch("app.services.rag_service.call_gemini", new_callable=AsyncMock)
async def test_rag_response_with_results(mock_call_gemini, mock_search_documents):
    # Arrange
    mock_search_documents.return_value = [
        {"content": "Microsoft role for software engineer."}
    ]
    mock_call_gemini.return_value = "This is a mocked professional counselor response."
    
    # Act
    result = await get_rag_response("What about Microsoft?")
    
    # Assert
    mock_search_documents.assert_called_once_with("What about Microsoft?", top_k=5)
    mock_call_gemini.assert_called_once()
    
    # Verify the prompt generation included our context
    prompt_used = mock_call_gemini.call_args[0][0]
    assert "Microsoft role for software engineer." in prompt_used
    assert "Career Counselor" in prompt_used
    
    assert result == "This is a mocked professional counselor response."

@pytest.mark.asyncio
@patch("app.services.rag_service.search_documents", new_callable=AsyncMock)
async def test_rag_response_no_results(mock_search_documents):
    # Arrange
    mock_search_documents.return_value = []
    
    # Act
    result = await get_rag_response("What about completely_made_up_company?")
    
    # Assert
    assert "couldn't find specific details" in result
    # It should early exit, so call_gemini should theoretically not be hit
