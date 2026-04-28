from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Application, ApplicationStatus
from app.services.email_service import GmailService
import base64

async def process_gmail_push(user_email: str, new_history_id: str):
    db: Session = SessionLocal()
    try:
        # Find active applications for this user
        apps = db.query(Application).filter(
            Application.user_email == user_email,
            Application.status == ApplicationStatus.PENDING
        ).all()
        
        if not apps:
            return # No pending applications for this user
            
        # All apps for this user share the same credentials
        app_record = apps[0]
        if not app_record.refresh_token:
            return
            
        credentials = GmailService.get_credentials(access_token="", refresh_token=app_record.refresh_token)
        credentials = GmailService.ensure_valid_credentials(credentials)
        
        # Get history changes since the lowest last_history_id
        min_history_id = min((a.last_history_id for a in apps if a.last_history_id), default=None)
        if not min_history_id:
            min_history_id = new_history_id
            
        history_events = GmailService.get_history(credentials, min_history_id)
        
        # Collect message IDs that were added
        added_message_ids = []
        for event in history_events:
            if 'messagesAdded' in event:
                for msg_added in event['messagesAdded']:
                    added_message_ids.append(msg_added['message']['id'])
                    
        # Now we fetch the details of these messages to see if they belong to our tracked threads
        service = GmailService.get_service(credentials)
        
        for msg_id in added_message_ids:
            try:
                msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
                thread_id = msg['threadId']
                
                # Check if this thread_id belongs to any of our pending applications
                matching_app = next((a for a in apps if a.thread_id == thread_id), None)
                if matching_app:
                    # Parse sender
                    headers = msg['payload']['headers']
                    sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
                    
                    if user_email.lower() not in sender.lower():
                        # This is a reply from someone else!
                        
                        # Extract body text
                        body_data = None
                        if 'parts' in msg['payload']:
                            for part in msg['payload']['parts']:
                                if part['mimeType'] == 'text/plain':
                                    body_data = part['body'].get('data')
                                    break
                        elif msg['payload']['mimeType'] == 'text/plain':
                            body_data = msg['payload']['body'].get('data')
                            
                        if body_data:
                            email_text = base64.urlsafe_b64decode(body_data).decode('utf-8')
                            
                            from app.services.classifier import classify_reply
                            new_status = classify_reply(email_text)
                            
                            matching_app.status = new_status
                            
                    # Update the app's history ID so we don't process it again
                    matching_app.last_history_id = new_history_id
                    
            except Exception as e:
                print(f"Error processing message {msg_id}: {e}")
                
        db.commit()
    except Exception as e:
        print(f"Error in process_gmail_push: {e}")
    finally:
        db.close()
