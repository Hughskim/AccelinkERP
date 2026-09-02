from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import customer

# 실제 도메인별 라우터들을 임포트합니다.
from app.routers import (
    customer_router,
    product_router,   # 👈 수정: SQL 주석(--)을 Python 주석(#)으로 변경
    rma_router,       # 👈 수정
    sample_router     # 👈 수정
)

# 서버 시작 시 SQLAlchemy 모델 구조들을 DB 엔진과 바인딩
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

# 라우터 등록
app.include_router(customer_router.router, prefix="/api/customers", tags=["고객 관리 (Customer Master)"])
app.include_router(product_router.router, prefix="/api/products", tags=["제품 관리 (Product Master)"])
app.include_router(rma_router.router, prefix="/api/rma", tags=["RMA 관리"])
app.include_router(sample_router.router, prefix="/api/samples", tags=["샘플 관리 (Sample Master/Process)"])


@app.get("/", tags=["기본 시스템"])
def root():
    return {
        "status": "healthy",
        "message": "AccelinkERP API is running successfully",
        "database": "Neon PostgreSQL Connected"
    }