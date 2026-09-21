import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import Base, engine, SessionLocal
from app.services.seed_service import seed_service

# Import Routers
from app.api.routers import (
    auth, courses, documents, tutor, quizzes, mastery, planner,
    flashcards, mistakes, pyq, knowledge_graph, analytics, teacher, solver, summary
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Auto-create tables on launch
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Error initializing database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Middleware to capture Groq API Key from frontend request headers
@app.middleware("http")
async def extract_groq_key_middleware(request: Request, call_next):
    groq_header_key = request.headers.get("x-groq-api-key") or request.headers.get("X-Groq-Api-Key")
    if groq_header_key and groq_header_key.startswith("gsk_"):
        settings.GROQ_API_KEY = groq_header_key
    response = await call_next(request)
    return response

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

@app.get("/")
def root():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": settings.VERSION}

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(courses.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(tutor.router, prefix=settings.API_V1_STR)
app.include_router(quizzes.router, prefix=settings.API_V1_STR)
app.include_router(mastery.router, prefix=settings.API_V1_STR)
app.include_router(planner.router, prefix=settings.API_V1_STR)
app.include_router(flashcards.router, prefix=settings.API_V1_STR)
app.include_router(mistakes.router, prefix=settings.API_V1_STR)
app.include_router(pyq.router, prefix=settings.API_V1_STR)
app.include_router(knowledge_graph.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(teacher.router, prefix=settings.API_V1_STR)
app.include_router(solver.router, prefix=settings.API_V1_STR)
app.include_router(summary.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_service.seed_demo_data(db)
        logger.info("Seed data loaded successfully.")
    except Exception as e:
        logger.warning(f"Seed data loading error: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Welcome to StudyMind AI Backend API",
        "docs": "/docs",
        "status": "healthy"
    }
