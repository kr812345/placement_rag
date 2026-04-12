import re
from typing import Dict, Any, List

def normalize_text(value: str) -> str:
    """Strip whitespace and lowercase text."""
    if not isinstance(value, str):
        return ""
    return value.strip().lower()

def slugify(value: str) -> str:
    """Convert text to a slug format (lowercase, underscores)."""
    value = normalize_text(value)
    value = re.sub(r'[^a-z0-9]+', '_', value)
    return value.strip('_')

def clean_list(values: List[str]) -> List[str]:
    """Normalize and deduplicate a list of strings."""
    if not values:
        return []
    return list(set([normalize_text(v) for v in values if v and v.strip()]))

def extract_primary_location(locations: List[str]) -> str:
    """Extract and simplify the first location from a list."""
    if not locations:
        return ""
    # Take first location and simplify (e.g., "Gurgaon, Haryana" -> "gurgaon")
    primary = locations[0].split(",")[0]
    return normalize_text(primary)

def generate_role_id(company: str, title: str, role_type: str) -> str:
    """Generate a unique ID for a role."""
    return f"{slugify(company)}_{slugify(title)}_{slugify(role_type)}"

def generate_embedding_text(data: Dict[str, Any]) -> str:
    """
    Generate a descriptive text block for embedding creation.
    Concatenates various job details into a natural language format.
    """
    role = data.get("role", {})
    company = data.get("company", {})
    skills = data.get("skills", {})
    eligibility = data.get("eligibility", {})
    selection = data.get("selection_process", [])

    title = role.get("title", "")
    company_name = company.get("name", "")
    category = role.get("category", "")
    role_type = role.get("type", "")
    location = ", ".join(role.get("location", [])[:1])

    degrees = ", ".join(eligibility.get("degrees", []))
    years = ", ".join(eligibility.get("year", []))

    must_have = ", ".join(skills.get("must_have", []))
    selection_steps = ", ".join(selection)

    parts = []

    # Sentence 1: Basic Role and Company Info
    if title and company_name:
        parts.append(
            f"{title} role at {company_name}"
            + (f" for {years} {degrees} candidates" if years or degrees else "")
            + "."
        )

    # Sentence 2: Skills and Category
    if must_have or category:
        parts.append(
            f"Requires skills in {must_have}"
            + (f" within {category}" if category else "")
            + "."
        )

    # Sentence 3: Selection Process
    if selection_steps:
        parts.append(
            f"The selection process includes {selection_steps}."
        )

    # Sentence 4: Type and Location
    if role_type or location:
        parts.append(
            f"This is a {role_type} role"
            + (f" based in {location}" if location else "")
            + "."
        )

    return " ".join(parts).strip()

def build_filters(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a structured dictionary for filtering."""
    role = data.get("role", {})
    skills = data.get("skills", {})

    return {
        "role": slugify(role.get("title", "")),
        "type": slugify(role.get("type", "")),
        "location": extract_primary_location(role.get("location", [])),
        "skills": clean_list(skills.get("must_have", [])),
        "difficulty": normalize_text(data.get("difficulty", ""))
    }

def preprocess(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for preprocessing a single company role document.
    Returns a dictionary ready for the vector store.
    """
    role = data.get("role", {})
    company = data.get("company", {})

    role_id = generate_role_id(
        company.get("name", ""),
        role.get("title", ""),
        role.get("type", "")
    )

    embedding_text = generate_embedding_text(data)
    filters = build_filters(data)

    # Keep a copy of the metadata but add the role_id
    metadata = data.copy()
    metadata["role_id"] = role_id

    return {
        "id": role_id,
        "embedding_text": embedding_text,
        "filters": filters,
        "metadata": metadata
    }
