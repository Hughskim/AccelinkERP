from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# 데이터베이스 자동 바인딩을 위해 모든 도메인 모델 패키지를 임포트합니다.
from app.models import customer, product, price, po, payment, rma, sample

# 연동이 완료된 최종 라우터 패키지 군단을 임포트합니다.
from app.routers import (
    customer_router, 
    product_router, 
    price_router, 
    po_router, 
    payment_router, 
    rma_router,
    sample_router
)

# 서버 시작 시 Neon PostgreSQL 물리 테이블 매핑 및 스키마 구조 정합성 동기화
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
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ERP 전체 핵심 도메인별 API 라우터 일괄 등록
app.include_router(customer_router.router, prefix="/api/customers", tags=["고객 관리 (Customer Master)"])
app.include_router(product_router.router, prefix="/api/products", tags=["제품 관리 (Product Master)"])
app.include_router(price_router.router, prefix="/api/prices", tags=["단가 및 가격 관리 (Price Management)"])
app.include_router(po_router.router, prefix="/api/po", tags=["수주 및 선적/백로그 관리 (PO & Backlog & Shipment)"])
app.include_router(payment_router.router, prefix="/api/payments", tags=["수금 및 커미션 정산 관리 (Payment & Commission)"])
app.include_router(rma_router.router, prefix="/api/rma", tags=["RMA 및 반품/수리 관리 (RMA Management)"])
app.include_router(sample_router.router, prefix="/api/samples", tags=["샘플 출하 및 승인 관리 (Sample Tracking)"])


@app.get("/", tags=["기본 시스템"])
def root():
    return {
        "status": "healthy",
        "message": "AccelinkERP API is running successfully",
        "database": "Neon PostgreSQL Connected"
    }
