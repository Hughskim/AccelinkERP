from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import customer

# 📌 현재 구현이 완료된 고객 관리 라우터만 정상적으로 불러옵니다.
from app.routers import customer_router

# 서버 시작 시 SQLAlchemy 모델 구조들을 DB 엔진과 연동
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AccelinkERP API",
    description="FastAPI 기반 ERP 백엔드 서버 (Neon PostgreSQL 연동)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📌 고객 관리 라우터만 안전하게 경로 매핑을 수행합니다.
app.include_router(customer_router.router, prefix="/api/customers", tags=["고객 관리 (Customer Master)"])


@app.get("/", tags=["기본 시스템"])
def root():
    return {
        "status": "healthy",
        "message": "AccelinkERP API is running successfully",
        "database": "Neon PostgreSQL Connected"
    }