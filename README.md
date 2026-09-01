#AccelinkERP > README.md
# AccelinkERP

FastAPI + MySQL 기반 ERP 백엔드 서버

## 실행 방법

### 1) 가상환경 생성
python -m venv erp_env
erp_env\Scripts\activate

### 2) 패키지 설치
pip install -r requirements.txt

### 3) 서버 실행
uvicorn app.main:app --reload
