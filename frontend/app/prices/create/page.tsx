'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PriceCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 쿼리 스트링 (?product_id=xxx) 파싱 및 초기화
  const productIdFromQuery = searchParams.get("product_id") || "";

  // 📝 입력 폼 상태 관리
  const [formData, setFormData] = useState({
    product_id: productIdFromQuery,
    customer_id: "",
    currency_code: "USD", // 기본값 매핑
    price_type: "",
    price_policy: "",
    price_value: "",
    price_quote: "",
    price_date: new Date().toISOString().substring(0, 10), // 오늘 날짜 기본값 (YYYY-MM-DD)
  });

  // 🗂️ 백엔드 통합 코드 시스템에서 분류하여 저장할 상자들
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [priceTypes, setPriceTypes] = useState<string[]>([]);
  const [pricePolicies, setPricePolicies] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔄 [참조 반영] 시스템 통합 코드 API 구조에 맞춰 로드 방식 최적화
  // 🔄 백엔드 가격 코드 엔드포인트(3개)와 직접 연동하여 드롭다운 리스트 로드
  useEffect(() => {
    const loadPriceSystemCodes = async () => {
      try {
        // 백엔드 price_router.py에 정의된 실제 코드 목록 API 3개를 병렬로 호출합니다.
        const [resCurr, resType, resPolicy] = await Promise.all([
          fetch("https://accelinkerp.onrender.com/api/price/codes/currency"),
          fetch("https://accelinkerp.onrender.com/api/price/codes/type"),
          fetch("https://accelinkerp.onrender.com/api/price/codes/policy")
        ]);

        // 각 응답이 성공(200 OK)했다면 json 배열 데이터를 상태(State)에 주입합니다.
        if (resCurr.ok) {
          const currencyList = await resCurr.json();
          setCurrencies(currencyList);
        }
        if (resType.ok) {
          const typeList = await resType.json();
          setPriceTypes(typeList);
        }
        if (resPolicy.ok) {
          const policyList = await resPolicy.json();
          setPricePolicies(policyList);
        }
      } catch (err) {
        console.error("🚫 가격 시스템 공통 코드 조회 실패:", err);
        setErrorMsg("공통 코드 목록을 불러오는 중 오류가 발생했습니다.");
      }
    };
    
    loadPriceSystemCodes();
  }, []);


  // ✍️ 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🚀 서버에 일괄 저장 요청 전송 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1) 필수 데이터 유효성 검사
    if (!formData.product_id || !formData.customer_id || !formData.price_value) {
      setErrorMsg("제품 ID, 고객 ID, 단가는 필수 입력 항목입니다.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    // 2) 백엔드 Pydantic 데이터 포맷에 맞추어 데이터 형식 변환 (String -> Int/Float/ISO Date)
    const payload = {
      product_id: parseInt(formData.product_id, 10),
      customer_id: parseInt(formData.customer_id, 10),
      currency_code: formData.currency_code,
      price_type: formData.price_type || null,
      price_policy: formData.price_policy || null,
      price_value: parseFloat(formData.price_value),
      price_quote: formData.price_quote ? parseFloat(formData.price_quote) : null,
      price_date: new Date(formData.price_date).toISOString(), // 백엔드 datetime 포맷 준수
    };

    try {
      // 3) 백엔드 원자적 복합 저장 API 호출
      const res = await fetch("https://onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "서버 저장 실패");
      }

      alert("가격 마스터 및 최초 단가 이력이 성공적으로 저장되었습니다.");
      
      // 4) 성공 시 메인 가격 검색 화면으로 페이지 이동 및 갱신
      router.push("/prices");
    } catch (err: any) {
      console.error("제출 에러 발생:", err);
      setErrorMsg(err.message || "서버와 통신 중 에러가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* 1. 상단 레이아웃 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <h1 className="font-bold text-base text-slate-800">신규 가격 등록</h1>
        <Link href="/prices">
          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition">
            취소
          </button>
        </Link>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-left">
          
          {/* 시스템 예외 경고 메시지 창 */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 인풋 1) 제품 ID */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">제품 ID *</label>
            <input
              type="number"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              placeholder="제품 ID"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
              readOnly={!!productIdFromQuery} // 검색화면에서 유입 시 고정 활성화
            />
          </div>

          {/* 인풋 2) 고객 ID */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">고객 ID *</label>
            <input
              type="number"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              placeholder="고객 ID 숫자 입력"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              required
            />
          </div>

          {/* 인풋 3) 통화 코드 선택 드롭다운 */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">통화 코드 *</label>
            <select
              name="currency_code"
              value={formData.currency_code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {currencies.length > 0 ? (
                currencies.map((code) => <option key={code} value={code}>{code}</option>)
              ) : (
                <option value="USD">USD</option>
              )}
            </select>
          </div>

          {/* 인풋 4) 가격 타입 및 가격 정책 (가로 정렬 grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">가격 타입</label>
              <select
                name="price_type"
                value={formData.price_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">선택 안함</option>
                {priceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">가격 정책</label>
              <select
                name="price_policy"
                value={formData.price_policy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">선택 안함</option>
                {pricePolicies.map((policy) => (
                  <option key={policy} value={policy}>{policy}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 인풋 5) 단가 금액 */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">단가 (Price Value) *</label>
            <input
              type="number"
              step="0.01"
              name="price_value"
              value={formData.price_value}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold"
              required
            />
          </div>

          {/* 인풋 6) 견적 단가 금액 */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">견적가 (Price Quote)</label>
            <input
              type="number"
              step="0.01"
              name="price_quote"
              value={formData.price_quote}
              onChange={handleChange}
              placeholder="미기입 시 빈 값 저장"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            />
          </div>

          {/* 인풋 7) 가격 승인 달력 선택기 */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">승인일 (Price Date) *</label>
            <input
              type="date"
              name="price_date"
              value={formData.price_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              required
            />
          </div>

          {/* 전송 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition"
          >
            {submitting ? "저장 중..." : "확인 및 가격 등록 완료"}
          </button>

        </form>
      </main>
    </div>
  );
}
