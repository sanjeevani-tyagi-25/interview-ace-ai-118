from pydantic import BaseModel, ConfigDict


# ==========================
# REQUEST SCHEMA
# ==========================

class AnswerCreate(BaseModel):
    question_id: int
    answer_text: str


# ==========================
# RESPONSE SCHEMA
# ==========================

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    answer_text: str
    score: int
    feedback: str

    model_config = ConfigDict(from_attributes=True)