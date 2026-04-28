from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
import os

router = APIRouter()

class EmailGenerationRequest(BaseModel):
    company: str
    role: str
    user_name: str

@router.post("/generate-email")
async def generate_email(req: EmailGenerationRequest):
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not found in environment")
            
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        Write a professional and concise job application email.
        Details:
        - Role: {req.role}
        - Company: {req.company}
        - Applicant Name: {req.user_name}
        
        Guidelines:
        - Keep it professional but enthusiastic.
        - Mention interest in the specific company and role.
        - Leave placeholders like [Your Phone Number] or [Link to Portfolio] if necessary.
        - Do not include the subject line, only the body of the email.
        - Make it around 150-200 words.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return {"email_body": response.text}
        
    except Exception as e:
        print(f"AI Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
