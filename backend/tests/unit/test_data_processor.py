import pytest
from app.services.data_processor import (
    normalize_text,
    slugify,
    clean_list,
    extract_primary_location,
    generate_role_id,
    generate_embedding_text,
    preprocess
)

def test_normalize_text():
    assert normalize_text("  Hello World  ") == "hello world"
    assert normalize_text(None) == ""

def test_slugify():
    assert slugify("Google Inc.") == "google_inc"
    assert slugify("Senior Software Engineer (Backend)") == "senior_software_engineer_backend"

def test_clean_list():
    raw_list = ["Java", "  Python  ", "", "java"]
    cleaned = clean_list(raw_list)
    assert len(cleaned) == 2
    assert "java" in cleaned
    assert "python" in cleaned

def test_extract_primary_location():
    locations = ["Gurgaon, Haryana, India", "Bangalore"]
    assert extract_primary_location(locations) == "gurgaon"
    assert extract_primary_location([]) == ""

def test_generate_role_id():
    role_id = generate_role_id("Google", "Software Engineer", "Full-time")
    assert role_id == "google_software_engineer_full_time"

def test_preprocess_and_embedding_text():
    mock_data = {
        "company": {"name": "TestCorp"},
        "role": {
            "title": "Backend Dev",
            "category": "Engineering",
            "type": "Full-time",
            "location": ["Remote, US"]
        },
        "skills": {"must_have": ["Python", "FastAPI"]},
        "selection_process": ["OA", "Interview"]
    }
    
    result = preprocess(mock_data)
    
    assert result["id"] == "testcorp_backend_dev_full_time"
    assert "Python, FastAPI" in result["embedding_text"]
    assert "Backend Dev role at TestCorp" in result["embedding_text"]
    assert "selection process includes OA, Interview" in result["embedding_text"]
    assert result["filters"]["difficulty"] == ""
