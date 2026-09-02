from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# 데이터베이스 자동 바인딩을 위해 모든 도메인 모델 패키지를 임포트합니다.
from app.models import customer, product, price, po

# 연동이 완료된 라우터들을 가져옵니다.
from app.routers import customer_router, product_router, price_router, po_router

# 서버 시작 시 물리 테이블 매핑 및 스키마 구조 동기화
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AccelinkERP API",
    description="FastAPI 기반 ERP 백엔드 서버 (Neon PostgreSQL 연동)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={"docExpansion": "none"}  # 대시보드를 폴더 형태로 깔끔하게 접어서 시작
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ERP 도메인별 API 라우터 등록
app.include_router(customer_router.router, prefix="/api/customers", tags=["고객 관리 (Customer Master)"])
app.include_router(product_router.router, prefix="/api/products", tags=["제품 관리 (Product Master)"])
app.include_router(price_router.router, prefix="/api/prices", tags=["단가 및 가격 관리 (Price Management)"])
app.include_router(po_router.router, prefix="/api/po", tags=["수주 및 선적/백로그 관리 (PO & Backlog & Shipment)"])


@app.get("/", tags=["기본 시스템"])
def root():
    return {
        "status": "healthy",
        "message": "AccelinkERP API is running successfully",
        "database": "Neon PostgreSQL Connected"
    }
