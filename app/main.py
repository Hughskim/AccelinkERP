from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# 📌 1. 데이터베이스 바인딩을 위해 고객 및 제품 ORM 모델들을 모두 임포트합니다.
from app.models import customer, product

# 📌 2. 연동할 라우터들을 가져옵니다.
from app.routers import customer_router, product_router

# 서버 시작 시 SQLAlchemy 모델 구조들을 DB 엔진과 연동 (테이블 구조 동기화)
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

# 📌 3. 각 마스터 관리 도메인별 라우터를 등록합니다.
app.include_router(customer_router.router, prefix="/api/customers", tags=["고객 관리 (Customer Master)"])
app.include_router(product_router.router, prefix="/api/products", tags=["제품 관리 (Product Master)"])


@app.get("/", tags=["기본 시스템"])
def root():
    return {
        "status": "healthy",
        "message": "AccelinkERP API is running successfully",
        "database": "Neon PostgreSQL Connected"
    }