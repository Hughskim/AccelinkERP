#AccelinkERP > app > main.py
from fastapi import FastAPI
from app.routers import customer_router

app = FastAPI(
    title="AccelinkERP API",
    description="FastAPI 기반 ERP 백엔드 서버",
    version="1.0.0"
)

# 라우터 등록
app.include_router(customer_router.router)

@app.get("/")
def root():
    return {"message": "AccelinkERP API is running"}
