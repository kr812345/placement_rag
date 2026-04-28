from fastapi import APIRouter, Request, BackgroundTasks
import base64
import json
from app.services.webhook_handler import process_gmail_push

router = APIRouter()

@router.post("/gmail")
async def gmail_webhook(request: Request, background_tasks: BackgroundTasks):
    # We wrap everything in a broad try-except to ensure we ALWAYS return a 200 OK.
    # This prevents Google Pub/Sub from retrying indefinitely if the payload is weird.
    try:
        body = await request.json()
        
        # Step 1: Extract base64 data from the Pub/Sub wrapper
        message = body.get("message", {})
        data = message.get("data")
        
        if not data:
            return {"status": "no data, but acked"}

        # Step 2: Decode URL-safe base64
        decoded_bytes = base64.urlsafe_b64decode(data + "===")
        decoded_str = decoded_bytes.decode('utf-8')
        
        # Step 3: Parse the decoded JSON payload
        payload = json.loads(decoded_str)
        
        user_email = payload.get("emailAddress")
        new_history_id = payload.get("historyId")
        
        if user_email and new_history_id:
            # Run in background to return 200 OK immediately
            background_tasks.add_task(process_gmail_push, user_email, str(new_history_id))
            
    except Exception as e:
        # Log the error but still return success to stop retries
        print(f"⚠️ Webhook processing suppressed a retry: {e}")
            
    return {"status": "success"}
