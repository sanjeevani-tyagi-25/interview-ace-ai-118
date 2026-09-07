from pydantic import BaseModel, EmailStr


# ============================================================
# REQUEST SCHEMAS
# ============================================================


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str
    email: EmailStr
    target_role: str | None = None
    experience: str | None = None


# ============================================================
# CHANGE PASSWORD
# ============================================================


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


# ============================================================
# NOTIFICATION PREFERENCE
# ============================================================


class NotificationPreference(BaseModel):
    enabled: bool


# ============================================================
# RESPONSE SCHEMA
# ============================================================


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    target_role: str | None = None
    experience: str | None = None
    profile_photo: str | None = None

    class Config:
        from_attributes = True