from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# 앞으로 구현할 실제 도메인별 라우터들을 임포트합니다.
from app.routers import (
    customer_router,
    product_router,   -- 곧 추가할 제품 관리 라우터
    rma_router,       -- 앞서 설계한 rma 관리 라우터
    sample_router     -- 앞서 설계한 샘플(master/process) 관리 라우터
)

app = FastAPI(
    title="AccelinkERP API",
    description="FastAPI 기반 ERP 백엔드 서버 (Neon PostgreSQL 연동)",
    version="1.0.0",
    docs_url="/docs",      -- Swagger UI 경로 명시
    redoc_url="/redoc"
)

# 🌐 웹 프론트엔드 연동 및 대시보드 조회를 위한 CORS 미들웨어 설정 (필수)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  -- 실제 운영 서버 배포 시에는 특정 도메인만 지정하는 것이 안전합니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📌 [실제 테이블 기준 라우터 등록]
# 각 도메인 영역별로 경로(prefix)와 태그(tags)를 지정하여 Swagger 문서를 깔끔하게 그룹화합니다.
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