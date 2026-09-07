print("✅ users.py loaded")

import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)

from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database.database import SessionLocal
from app.models.user import User
from app.core.dependencies import get_current_user

from app.schemas.user import (
    UserResponse,
    UserUpdate,
    ChangePassword,
    NotificationPreference,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# GET ALL USERS
# ============================================================

@router.get("/")
def get_users(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "target_role": user.target_role,
            "experience": user.experience,
            "profile_photo": user.profile_photo,
        }
        for user in users
    ]


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user=Depends(get_current_user),
):

    return current_user


# ============================================================
# UPDATE CURRENT USER PROFILE
# ============================================================

@router.put(
    "/me",
    response_model=UserResponse,
)
def update_me(
    user_data: UserUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # GET USER FROM CURRENT DATABASE SESSION
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # CHECK EMAIL
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email,
            User.id != user.id,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered by another user.",
        )

    # --------------------------------------------------------
    # UPDATE PROFILE
    # --------------------------------------------------------

    user.full_name = user_data.full_name
    user.email = user_data.email
    user.target_role = user_data.target_role
    user.experience = user_data.experience

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    db.commit()
    db.refresh(user)

    print(
        f"✅ Profile updated for user: {user.id}"
    )

    return user


# ============================================================
# UPLOAD PROFILE PHOTO
# ============================================================

@router.post(
    "/profile-photo",
    response_model=UserResponse,
)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # CHECK FILE
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    # --------------------------------------------------------
    # ALLOWED EXTENSIONS
    # --------------------------------------------------------

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG and WEBP images are supported.",
        )

    # --------------------------------------------------------
    # CHECK CONTENT TYPE
    # --------------------------------------------------------

    allowed_content_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid image type.",
        )

    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    contents = await file.read()

    # Maximum 5 MB
    max_size = 5 * 1024 * 1024

    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Profile photo must be less than 5 MB.",
        )

    # --------------------------------------------------------
    # GET USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # CREATE DIRECTORY
    # --------------------------------------------------------

    upload_directory = os.path.join(
        "uploads",
        "profile_photos",
    )

    os.makedirs(
        upload_directory,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # DELETE OLD PHOTO
    # --------------------------------------------------------

    if user.profile_photo:

        old_filename = os.path.basename(
            user.profile_photo
        )

        old_path = os.path.join(
            upload_directory,
            old_filename,
        )

        if os.path.exists(old_path):

            try:
                os.remove(old_path)

            except OSError:
                print(
                    "⚠️ Could not remove old profile photo."
                )

    # --------------------------------------------------------
    # CREATE UNIQUE FILENAME
    # --------------------------------------------------------

    filename = (
        f"user_{user.id}_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = os.path.join(
        upload_directory,
        filename,
    )

    # --------------------------------------------------------
    # SAVE IMAGE
    # --------------------------------------------------------

    with open(
        file_path,
        "wb",
    ) as image_file:

        image_file.write(contents)

    # --------------------------------------------------------
    # SAVE PATH IN DATABASE
    # --------------------------------------------------------

    user.profile_photo = (
        f"/uploads/profile_photos/{filename}"
    )

    db.commit()
    db.refresh(user)

    print(
        f"📸 Profile photo updated for user: {user.id}"
    )

    return user


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put(
    "/change-password",
)
def change_password(
    password_data: ChangePassword,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # VALIDATE NEW PASSWORD
    # --------------------------------------------------------

    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must contain at least 8 characters.",
        )

    # --------------------------------------------------------
    # GET USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # VERIFY CURRENT PASSWORD
    # --------------------------------------------------------

    if not verify_password(
        password_data.current_password,
        user.password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    # --------------------------------------------------------
    # PREVENT SAME PASSWORD
    # --------------------------------------------------------

    if verify_password(
        password_data.new_password,
        user.password,
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password.",
        )

    # --------------------------------------------------------
    # HASH NEW PASSWORD
    # --------------------------------------------------------

    user.password = hash_password(
        password_data.new_password
    )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    db.commit()

    print(
        f"🔐 Password changed successfully for user: {user.id}"
    )

    return {
        "message": "Password updated successfully."
    }


# ============================================================
# GET NOTIFICATION PREFERENCE
# ============================================================

@router.get(
    "/notification-preference",
)
def get_notification_preference(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return {
        "enabled": user.email_notifications
    }


# ============================================================
# UPDATE NOTIFICATION PREFERENCE
# ============================================================

@router.put(
    "/notification-preference",
)
def update_notification_preference(
    preference: NotificationPreference,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    user.email_notifications = preference.enabled

    db.commit()
    db.refresh(user)

    print(
        f"📧 Email notifications "
        f"{'enabled' if user.email_notifications else 'disabled'} "
        f"for user: {user.id}"
    )

    return {
        "enabled": user.email_notifications,
        "message": (
            "Email notifications enabled."
            if user.email_notifications
            else "Email notifications disabled."
        ),
    }