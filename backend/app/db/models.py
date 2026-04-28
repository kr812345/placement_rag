from sqlalchemy import Column, Integer, String, DateTime, Enum
from app.db.database import Base
import enum
from datetime import datetime

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    SELECTED = "selected"
    REJECTED = "rejected"
    INTERVIEW = "interview"
    ASSESSMENT = "online assessment"
    UNCLEAR = "unclear"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    company = Column(String)
    role = Column(String)
    thread_id = Column(String, unique=True, index=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    last_history_id = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
