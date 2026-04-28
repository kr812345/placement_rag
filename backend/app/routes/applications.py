from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Application
from app.schemas.application import EmailSendRequest
from app.services.email_service import GmailService
import os

router = APIRouter()

@router.post("/send")
async def send_application(req: EmailSendRequest, db: Session = Depends(get_db)):
    try:
        credentials = GmailService.get_credentials(req.access_token, req.refresh_token)
        
        # 1. Send the email with optional resume
        result = GmailService.send_application_email(
            credentials, 
            req.to_email, 
            req.subject, 
            req.body,
            req.resume_base64,
            req.resume_filename
        )
        
        # 2. Subscribe to Gmail Push Notifications
        topic_name = os.getenv("GMAIL_PUB_SUB_TOPIC")
        history_id = None
        if topic_name:
            history_id = GmailService.watch_inbox(credentials, topic_name)
            
        # 3. Save to database
        app_record = Application(
            user_email=req.user_id, # Frontend should pass user email here
            company=req.company,
            role=req.role,
            thread_id=result['threadId'],
            last_history_id=history_id,
            refresh_token=req.refresh_token
        )
        db.add(app_record)
        db.commit()
        
        return {"status": "success", "thread_id": result['threadId'], "history_id": history_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_applications(user_email: str, db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.user_email == user_email).all()
    return apps
