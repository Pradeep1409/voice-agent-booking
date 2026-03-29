from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, create_engine, Session
from app.config import settings

class Appointment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str
    appointment_date: str
    appointment_time: str
    service_type: str
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=datetime.utcnow)

engine = create_engine(settings.DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
