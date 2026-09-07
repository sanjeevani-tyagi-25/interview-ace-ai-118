from pydantic import BaseModel
from typing import Optional


# ---------- Request Schema ----------

class InterviewCreate(BaseModel):
    title: str
    company: Optional[str] = None
    role: str
    domain: str
    difficulty: str
    interview_type: str
    total_questions: int = 10


# ---------- Response Schema ----------

class InterviewResponse(BaseModel):
    id: int
    title: str
    company: Optional[str] = None
    role: str
    domain: str
    difficulty: str
    interview_type: str
    total_questions: int
    score: int

    class Config:
        from_attributes = True