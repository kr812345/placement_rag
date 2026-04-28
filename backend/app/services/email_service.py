from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import base64
import os

class GmailService:
    @staticmethod
    def get_credentials(access_token: str, refresh_token: str):
        return Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET")
        )

    @staticmethod
    def get_service(credentials):
        return build('gmail', 'v1', credentials=credentials)

    @staticmethod
    def send_application_email(credentials, to_email: str, subject: str, body: str, attachment_content: str = None, attachment_filename: str = None) -> dict:
        service = GmailService.get_service(credentials)
        
        # Create a multipart message
        message = MIMEMultipart()
        message['to'] = to_email
        message['subject'] = subject
        
        # Attach the body text
        message.attach(MIMEText(body))
        
        # Attach the PDF if provided
        if attachment_content and attachment_filename:
            try:
                # The content is expected to be a base64 encoded string from the frontend
                part = MIMEBase('application', 'pdf')
                part.set_payload(base64.b64decode(attachment_content))
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename="{attachment_filename}"'
                )
                message.attach(part)
                print(f"✅ Successfully attached file: {attachment_filename}")
            except Exception as e:
                print(f"❌ Failed to attach file: {e}")

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

        sent = service.users().messages().send(
            userId='me',
            body={'raw': raw}
        ).execute()
        
        return sent  # Contains 'id' and 'threadId'

    @staticmethod
    def watch_inbox(credentials, topic_name: str):
        service = GmailService.get_service(credentials)
        request_body = {
            'labelIds': ['INBOX'],
            'topicName': topic_name
        }
        response = service.users().watch(userId='me', body=request_body).execute()
        return response['historyId']

    @staticmethod
    def get_history(credentials, start_history_id: str):
        """Fetch history changes since the given history ID."""
        service = GmailService.get_service(credentials)
        try:
            response = service.users().history().list(
                userId='me', 
                startHistoryId=start_history_id,
                historyTypes=['messageAdded']
            ).execute()
            
            return response.get('history', [])
        except Exception as e:
            print(f"Error fetching history: {e}")
            return []

    @staticmethod
    def ensure_valid_credentials(credentials):
        """Refreshes the access token if it has expired."""
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        return credentials
