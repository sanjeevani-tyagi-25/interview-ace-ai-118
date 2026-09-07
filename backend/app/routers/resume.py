from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
import json

from app.services.resume_service import (
    analyze_resume,
    generate_resume_report,
)

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.resume import ResumeAnalysis


router = APIRouter(
    prefix="/resume",
    tags=["Resume Analyzer"],
)


# ============================================================
# ANALYZE RESUME
# ============================================================

@router.post("/analyze")
async def analyze_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # VALIDATE FILE
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    allowed_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported.",
        )

    content = await file.read()

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 5 MB.",
        )

    # --------------------------------------------------------
    # ANALYZE RESUME
    # --------------------------------------------------------

    try:

        result = analyze_resume(
            filename=file.filename,
            content=content,
        )

        print("\n========================================")
        print("💾 SAVING RESUME ANALYSIS")
        print("========================================")

        # ----------------------------------------------------
        # CREATE DATABASE RECORD
        # ----------------------------------------------------

        resume_analysis = ResumeAnalysis(
            user_id=current_user.id,

            ats_score=int(
                result.get("atsScore", 0)
            ),

            skills_found=json.dumps(
                result.get("skillsFound", [])
            ),

            missing_skills=json.dumps(
                result.get("missingSkills", [])
            ),

            suggestions=json.dumps(
                result.get("suggestions", [])
            ),

            strengths=json.dumps(
                result.get("strengths", [])
            ),

            weaknesses=json.dumps(
                result.get("weaknesses", [])
            ),

            summary=result.get(
                "summary",
                "",
            ),

            experience_feedback=result.get(
                "experienceFeedback",
                "",
            ),

            projects_feedback=result.get(
                "projectsFeedback",
                "",
            ),

            keyword_feedback=result.get(
                "keywordFeedback",
                "",
            ),

            filename=file.filename,
        )

        db.add(resume_analysis)

        db.commit()

        db.refresh(resume_analysis)

        print(
            f"✅ Resume analysis saved successfully"
        )

        print(
            f"User ID: {current_user.id}"
        )

        print(
            f"Resume Analysis ID: {resume_analysis.id}"
        )

        print(
            f"ATS Score: {resume_analysis.ats_score}/100"
        )

        print("========================================")

        return result

    except HTTPException:
        raise

    except Exception as error:

        db.rollback()

        print(
            "❌ Resume analysis error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze resume.",
        )


# ============================================================
# DOWNLOAD RESUME REPORT
# ============================================================

@router.post("/report")
async def download_resume_report(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # VALIDATE FILE
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    allowed_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported.",
        )

    content = await file.read()

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 5 MB.",
        )

    # --------------------------------------------------------
    # GENERATE PDF REPORT
    # --------------------------------------------------------

    try:

        result = analyze_resume(
            filename=file.filename,
            content=content,
        )

        pdf = generate_resume_report(
            result
        )

        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    'attachment; filename="InterviewAI_Resume_Report.pdf"'
            },
        )

    except HTTPException:
        raise

    except Exception as error:

        print(
            "❌ Resume report error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate resume report.",
        )


# ============================================================
# GET LATEST RESUME SCORE
# ============================================================

@router.get("/latest")
def get_latest_resume_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    latest_analysis = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.user_id == current_user.id
        )
        .order_by(
            ResumeAnalysis.created_at.desc()
        )
        .first()
    )

    # --------------------------------------------------------
    # NO RESUME ANALYSIS YET
    # --------------------------------------------------------

    if latest_analysis is None:

        return {
            "hasResume": False,
            "atsScore": None,
        }

    # --------------------------------------------------------
    # RETURN LATEST SCORE
    # --------------------------------------------------------

    return {
        "hasResume": True,
        "atsScore": latest_analysis.ats_score,
        "resumeAnalysisId": latest_analysis.id,
        "filename": latest_analysis.filename,
        "createdAt": latest_analysis.created_at,
    }