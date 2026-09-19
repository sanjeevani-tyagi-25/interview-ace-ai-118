<<<<<<< HEAD:backend/app/main.py
# ============================================================
# INTERVIEWAI - MAIN APPLICATION
# ============================================================

from dotenv import load_dotenv

# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# FASTAPI IMPORTS
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles


# ============================================================
# PYTHON IMPORTS
# ============================================================

import os


# ============================================================
# SQLALCHEMY
# ============================================================

from sqlalchemy.orm import configure_mappers


# ============================================================
# DATABASE
# ============================================================

from app.database.database import Base, engine


# ============================================================
# IMPORT ALL MODELS
# ============================================================
# IMPORTANT:
# Every model that participates in a relationship must be
# imported BEFORE configure_mappers().
# ============================================================

from app.models.user import User
from app.models.interview import Interview
from app.models.questions import Question
from app.models.answer import Answer
from app.models.report import Report, QuestionReport
from app.models.resume import ResumeAnalysis


# ============================================================
# IMPORT ALL ROUTERS
# ============================================================

from app.routers import auth
from app.routers import users
from app.routers import interview
from app.routers import questions
from app.routers import answers
from app.routers import report
from app.routers import resume


# ============================================================
# CONFIGURE SQLALCHEMY MAPPERS
# ============================================================

configure_mappers()


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="InterviewAI API",
    description="AI Powered Mock Interview Platform",
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:3000",
        "http://127.0.0.1:3000",

        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# STATIC UPLOAD DIRECTORY
# ============================================================
#
# Profile photos are stored here:
#
# backend/
# └── uploads/
#     └── profile_photos/
#
# FastAPI exposes this folder through:
#
# http://localhost:8000/uploads/...
#
# ============================================================

UPLOAD_DIR = os.path.join(
    "uploads"
)

PROFILE_PHOTO_DIR = os.path.join(
    UPLOAD_DIR,
    "profile_photos"
)


# ============================================================
# CREATE UPLOAD DIRECTORIES
# ============================================================

os.makedirs(
    PROFILE_PHOTO_DIR,
    exist_ok=True,
)


# ============================================================
# SERVE UPLOADED FILES
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_DIR
    ),
    name="uploads",
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

# Authentication
app.include_router(
    auth.router
)


# Users
app.include_router(
    users.router
)


# Interviews
app.include_router(
    interview.router
)


# Questions
app.include_router(
    questions.router
)


# Answers
app.include_router(
    answers.router
)


# Interview Reports
app.include_router(
    report.router
)


# Resume Analyzer
app.include_router(
    resume.router
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "InterviewAI API is running",
        "status": "success",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "InterviewAI API",
    }


# ============================================================
# PRINT REGISTERED ROUTES
# ============================================================

print("\n" + "=" * 70)
print("REGISTERED ROUTES")
print("=" * 70)

for route in app.routes:

    if isinstance(route, APIRoute):

        methods = ", ".join(
            sorted(route.methods)
        )

        print(
            f"{methods:<15} {route.path}"
        )

print("=" * 70)
print("InterviewAI API initialized successfully")
=======
# ============================================================
# INTERVIEWAI - MAIN APPLICATION
# ============================================================

from dotenv import load_dotenv

# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# FASTAPI IMPORTS
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles


# ============================================================
# PYTHON IMPORTS
# ============================================================

import os


# ============================================================
# SQLALCHEMY
# ============================================================

from sqlalchemy.orm import configure_mappers


# ============================================================
# DATABASE
# ============================================================

from app.database.database import Base, engine


# ============================================================
# IMPORT ALL MODELS
# ============================================================
# IMPORTANT:
# Every model that participates in a relationship must be
# imported BEFORE configure_mappers().
# ============================================================

from app.models.user import User
from app.models.interview import Interview
from app.models.questions import Question
from app.models.answer import Answer
from app.models.report import Report, QuestionReport
from app.models.resume import ResumeAnalysis


# ============================================================
# IMPORT ALL ROUTERS
# ============================================================

from app.routers import auth
from app.routers import users
from app.routers import interview
from app.routers import questions
from app.routers import answers
from app.routers import report
from app.routers import resume


# ============================================================
# CONFIGURE SQLALCHEMY MAPPERS
# ============================================================

configure_mappers()


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="InterviewAI API",
    description="AI Powered Mock Interview Platform",
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:3000",
        "http://127.0.0.1:3000",

        "http://localhost:8080",
        "http://127.0.0.1:8080",

        # Production - Vercel
        "https://interview-ace-ai-118-9ohq-smoky.vercel.app",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# STATIC UPLOAD DIRECTORY
# ============================================================
#
# Profile photos are stored here:
#
# backend/
# └── uploads/
#     └── profile_photos/
#
# FastAPI exposes this folder through:
#
# http://localhost:8000/uploads/...
#
# ============================================================

UPLOAD_DIR = os.path.join(
    "uploads"
)

PROFILE_PHOTO_DIR = os.path.join(
    UPLOAD_DIR,
    "profile_photos"
)


# ============================================================
# CREATE UPLOAD DIRECTORIES
# ============================================================

os.makedirs(
    PROFILE_PHOTO_DIR,
    exist_ok=True,
)


# ============================================================
# SERVE UPLOADED FILES
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_DIR
    ),
    name="uploads",
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

# Authentication
app.include_router(
    auth.router
)


# Users
app.include_router(
    users.router
)


# Interviews
app.include_router(
    interview.router
)


# Questions
app.include_router(
    questions.router
)


# Answers
app.include_router(
    answers.router
)


# Interview Reports
app.include_router(
    report.router
)


# Resume Analyzer
app.include_router(
    resume.router
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "InterviewAI API is running",
        "status": "success",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "InterviewAI API",
    }


# ============================================================
# PRINT REGISTERED ROUTES
# ============================================================

print("\n" + "=" * 70)
print("REGISTERED ROUTES")
print("=" * 70)

for route in app.routes:

    if isinstance(route, APIRoute):

        methods = ", ".join(
            sorted(route.methods)
        )

        print(
            f"{methods:<15} {route.path}"
        )

print("=" * 70)
print("InterviewAI API initialized successfully")
>>>>>>> bf1a8be (Fix CORS for Vercel frontend):app/main.py
print("=" * 70 + "\n")