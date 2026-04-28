from google import genai
import os

def classify_reply(email_text: str) -> str:
    try:
        # Use existing gemini client configuration from environment
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        
        prompt = f"""
        You are an AI assistant parsing job application replies.
        Read the following email from a recruiter and classify the status into exactly one of these categories:
        [selected, rejected, interview, online assessment, unclear]

        Email content:
        "{email_text}"

        Return ONLY the category name in lowercase.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip().lower()
    except Exception as e:
        print(f"Failed to classify reply: {e}")
        return "unclear"
