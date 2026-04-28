from pydantic import BaseModel, EmailStr

class EmailSendRequest(BaseModel):
    user_id: str
    company: str
    role: str
    to_email: EmailStr
    subject: str
    body: str
    access_token: str
    refresh_token: str

class ApplicationResponse(BaseModel):
    id: int
    user_email: str
    company: str
    role: str
    status: str
    thread_id: str
    
    class Config:
        from_attributes = True
