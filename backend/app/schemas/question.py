from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str = "Technical"
    expected_answer: Optional[str] = None
    question_order: int


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    expected_answer: Optional[str]
    question_order: int
    created_at: datetime

    class Config:
        from_attributes = True