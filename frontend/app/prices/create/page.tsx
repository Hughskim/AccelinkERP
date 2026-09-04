'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PriceCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 쿼리 스트링 (?product_id=xxx&part_number=xxx) 파싱
  const productIdFromQuery = searchParams.get("product_id") || "";
  const partNumberFromQuery = searchParams.get("part_number") || "";

  // 📝 메인 가격 등록 폼 상태 구조 정의
  const [formData, setFormData] = useState({
    product_id: productIdFromQuery,
    part_number: partNumberFromQuery || (productIdFromQuery ? `제품 ID: ${productIdFromQuery}` : "선택된 제품 없음"),
    customer_id: "",
    currency_code: "USD",
    price_type: "",
    price_policy: "",
    price_value: "",
    price_quote: "",
    price_date: new Date().toISOString().substring(0, 10), // 오늘 날짜 초기 바인딩
  });

  // ✨ 현재 활성화되어 펼쳐진 인라인 폼 종류 추적 상태 ("currency" | "type" | "policy" | null)
  const [activeForm, setActiveForm] = useState<"currency" | "type" | "policy" | null>(null);

  // ✨ 제공해주신 3개 DB 테이블 구조의 필수/선택 컬럼을 수용하는 서브 폼 상태
  const [inlineForm, setInlineForm] = useState({
    code: "",          // policy_code / type_code / currency_code 역할
    name: "",          // policy_name / type_name / currency_name 역할
    description: "",   // 공통 설명 (Text)
    symbol: "",        // currency_codes 전용 기호
    decimal_places: "2", // currency_codes 전용 소수점 자리수
  });

  // 🗂️ 백엔드 연동 마스터 데이터 저장소
  const [customers, setCustomers] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [priceTypes, setPriceTypes] = useState<any[]>([]);
  const [pricePolicies, setPricePolicies] = useState<any[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔄 실시간 드롭다운 셀렉트 목록 리패치(새로고침) 함수
  const loadRequiredMasterData = async () => {
    try {
      const [resCust, resCurr, resType, resPolicy] = await Promise.all([
        fetch("https://accelinkerp.onrender.com/api/customers"),
        fetch("https://accelinkerp.onrender.com/api/prices/codes/currency"),
        fetch("https://accelinkerp.onrender.com/api/prices/codes/type"),
        fetch("https://accelinkerp.onrender.com/api/prices/codes/policy")
      ]);

      if (resCust.ok) setCustomers(await resCust.json());
      if (resCurr.ok) setCurrencies(await resCurr.json());
      if (resType.ok) setPriceTypes(await resType.json());
      if (resPolicy.ok) setPricePolicies(await resPolicy.json());
    } catch (err) {
      console.error("기준 마스터 데이터 로드 실패:", err);
    }
  };

  // 컴포넌트 첫 로딩 시 마스터 데이터 로드 트리거
  useEffect(() => {
    loadRequiredMasterData();
  }, []);

  // ✍️ 입력값 제어 핸들러 함수
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInlineFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInlineForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✨ [+] 클릭 시 개별 테이블 컬럼 세팅 초기화 및 인라인 토글
  const toggleInlineForm = (type: "currency" | "type" | "policy") => {
    if (activeForm === type) {
      setActiveForm(null);
    } else {
      setActiveForm(type);
      setInlineForm({
        code: "",
        name: "",
        description: "",
        symbol: "",
        decimal_places: "2",
      });
    }
  };
  // 🚀 [스키마 맞춤 분기] 인라인 [+] 등록 버튼 클릭 시 개별 테이블 컬럼 처리
  const handleSaveInlineCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inlineForm.code.trim() || !inlineForm.name.trim()) {
      alert("코드 식별자와 명칭은 필수 입력 사항입니다.");
      return;
    }

    let payload: any = {};
    let endpoint = "";

    // 💡 전달받은 각 데이터 테이블 명세와 컬럼명 규격에 맞게 완벽 분기
    if (activeForm === "policy") {
      endpoint = "https://accelinkerp.onrender.com/api/prices/codes/policy";
      payload = {
        policy_code: inlineForm.code.trim(),
        policy_name: inlineForm.name.trim(),
        description: inlineForm.description.trim() || null
        // ❌ 요구사항 반영: 마지막 is_active는 생략
      };
    } else if (activeForm === "type") {
      endpoint = "https://accelinkerp.onrender.com/api/prices/codes/type";
      payload = {
        type_code: inlineForm.code.trim(),
        type_name: inlineForm.name.trim(),
        description: inlineForm.description.trim() || null
        // ❌ 요구사항 반영: 마지막 is_active는 생략
      };
    } else if (activeForm === "currency") {
      endpoint = "https://accelinkerp.onrender.com/api/prices/codes/currency";
      payload = {
        currency_code: inlineForm.code.trim(),
        currency_name: inlineForm.name.trim(),
        symbol: inlineForm.symbol.trim() || null,
        decimal_places: inlineForm.decimal_places ? parseInt(inlineForm.decimal_places, 10) : null,
        description: inlineForm.description.trim() || null
        // ❌ 요구사항 반영: 마지막 is_active는 생략
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "코드 생성 실패");
      }

      alert("새 공통 기준 정보가 성공적으로 반영되었습니다.");
      setActiveForm(null); // 인라인 폼 닫기
      loadRequiredMasterData(); // 상위 선택 드롭다운 리로드
    } catch (err: any) {
      alert(err.message || "등록 중 오류가 발생했습니다.");
    }
  };

  // 🚀 메인 가격 + 최초 이력 일괄 저장 요청 전송 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.customer_id || !formData.price_value) {
      setErrorMsg("제품명, 고객명, 단가는 필수 입력 항목입니다.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    // 백엔드 Pydantic (PriceWithFirstHistoryCreate) 스키마 규격 형변환
    const payload = {
      product_id: parseInt(formData.product_id, 10),
      customer_id: parseInt(formData.customer_id, 10),
      currency_code: formData.currency_code,
      price_type: formData.price_type || null,
      price_policy: formData.price_policy || null,
      price_value: parseFloat(formData.price_value),
      price_quote: formData.price_quote ? parseFloat(formData.price_quote) : null,
      price_date: new Date(formData.price_date).toISOString(),
    };

    try {
      const res = await fetch("https://accelinkerp.onrender.com/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "서버 저장 실패");
      }

      alert("가격 마스터 및 최초 단가 이력이 성공적으로 저장되었습니다.");
      router.push("/prices"); // 메인 가격 검색 화면으로 이동
    } catch (err: any) {
      setErrorMsg(err.message || "서버 통신 에러");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <h1 className="font-bold text-base text-slate-800">신규 가격 등록</h1>
        <Link href="/prices">
          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition">
            취소
          </button>
        </Link>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1.5 text-left">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 1. 제품명 (수정 불가 고정) */}
          <div className="flex items-center border-b border-slate-100 py-0.5">
            <label className="w-20 text-xs font-bold text-slate-700 shrink-0">제품명 *</label>
            <input
              type="text"
              name="part_number"
              value={formData.part_number}
              className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 font-medium outline-none cursor-not-allowed"
              readOnly
            />
          </div>

          {/* 2. 고객명 (customer_name 드롭다운) */}
          <div className="flex items-center border-b border-slate-100 py-0.5">
            <label className="w-20 text-xs font-bold text-slate-700 shrink-0">고객명 *</label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
              required
            >
              <option value="">고객사 선택</option>
              {customers.map((cust: any) => (
                <option key={cust.customer_id} value={cust.customer_id}>{cust.customer_name}</option>
              ))}
            </select>
          </div>

          {/* 3. 통화 코드 + 인라인 확장 조합 */}
          <div className="space-y-1.5">
            <div className="flex items-center border-b border-slate-100 py-0.5 gap-1.5">
              <label className="w-20 text-xs font-bold text-slate-700 shrink-0">통화 코드 *</label>
              <select
                name="currency_code"
                value={formData.currency_code}
                onChange={handleChange}
                className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
              >
                {currencies.map((c) => {
                  const code = typeof c === 'string' ? c : c.currency_code;
                  return <option key={code} value={code}>{code}</option>;
                })}
              </select>
              <button
                type="button"
                onClick={() => toggleInlineForm("currency")}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-xs font-bold text-slate-500 shrink-0 transition"
              >
                {activeForm === "currency" ? "✕" : "+"}
              </button>
            </div>
            {activeForm === "currency" && renderInlineSubForm()}
          </div>

          {/* 4. 가격 타입 + 인라인 확장 조합 */}
          <div className="space-y-1.5">
            <div className="flex items-center border-b border-slate-100 py-0.5 gap-1.5">
              <label className="w-20 text-xs font-bold text-slate-700 shrink-0">가격 타입</label>
              <select
                name="price_type"
                value={formData.price_type}
                onChange={handleChange}
                className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
              >
                <option value="">선택 안함</option>
                {priceTypes.map((t: any) => (
                  <option key={t.type_code || t} value={t.type_code || t}>{t.type_name || t}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => toggleInlineForm("type")}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-xs font-bold text-slate-500 shrink-0 transition"
              >
                {activeForm === "type" ? "✕" : "+"}
              </button>
            </div>
            {activeForm === "type" && renderInlineSubForm()}
          </div>

          {/* 5. 가격 정책 + 인라인 확장 조합 */}
          <div className="space-y-1.5">
            <div className="flex items-center border-b border-slate-100 py-0.5 gap-1.5">
              <label className="w-20 text-xs font-bold text-slate-700 shrink-0">가격 정책</label>
              <select
                name="price_policy"
                value={formData.price_policy}
                onChange={handleChange}
                className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
              >
                <option value="">선택 안함</option>
                {pricePolicies.map((p: any) => (
                  <option key={p.policy_code || p} value={p.policy_code || p}>{p.policy_name || p}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => toggleInlineForm("policy")}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-xs font-bold text-slate-500 shrink-0 transition"
              >
                {activeForm === "policy" ? "✕" : "+"}
              </button>
            </div>
            {activeForm === "policy" && renderInlineSubForm()}
          </div>

          {/* 6. 단가 금액 */}
          <div className="flex items-center border-b border-slate-100 py-0.5">
            <label className="w-20 text-xs font-bold text-slate-700 shrink-0">단가 *</label>
            <input
              type="number"
              step="0.01"
              name="price_value"
              value={formData.price_value}
              onChange={handleChange}
              placeholder="0.00"
              className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-sm bg-white font-semibold focus:outline-none"
              required
            />
          </div>

          {/* 7. 견적 단가 금액 */}
          <div className="flex items-center border-b border-slate-100 py-0.5">
            <label className="w-20 text-xs font-bold text-slate-700 shrink-0">견적가</label>
            <input
              type="number"
              step="0.01"
              name="price_quote"
              value={formData.price_quote}
              onChange={handleChange}
              placeholder="미기입 시 빈 값 저장"
              className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
            />
          </div>

          {/* 8. 가격 승인 달력 선택기 */}
          <div className="flex items-center border-b border-slate-100 py-0.5">
            <label className="w-20 text-xs font-bold text-slate-700 shrink-0">승인일 *</label>
            <input
              type="date"
              name="price_date"
              value={formData.price_date}
              onChange={handleChange}
              className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
              required
            />
          </div>

          {/* 전송 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full !mt-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition"
          >
            {submitting ? "저장 중..." : "확인 및 가격 등록 완료"}
          </button>
        </form>
      </main>
    </div>
  );
  // 🎨 [컴포넌트 내 서브 렌더러 함수] 제공해주신 DB 스키마 3종을 정밀 동적 맵핑한 인라인 확장 폼
  function renderInlineSubForm() {
    const codeLabel = activeForm === "policy" ? "policy_code *" : activeForm === "type" ? "type_code *" : "currency_code *";
    const nameLabel = activeForm === "policy" ? "policy_name *" : activeForm === "type" ? "type_name *" : "currency_name *";
    const maxLength = activeForm === "currency" ? 10 : 20;

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-1 border-dashed space-y-2 text-xs">
        {/* 가변 인풋 A: 코드 식별자 키 */}
        <div className="flex items-center gap-2">
          <span className="w-24 text-slate-600 font-bold">{codeLabel}</span>
          <input
            type="text"
            name="code"
            maxLength={maxLength}
            value={inlineForm.code}
            onChange={handleInlineFormChange}
            placeholder="예: KRW | MP | Yearly"
            className="flex-1 px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none"
          />
        </div>

        {/* 가변 인풋 B: 코드 디스플레이 이름 명칭 */}
        <div className="flex items-center gap-2">
          <span className="w-24 text-slate-600 font-bold">{nameLabel}</span>
          <input
            type="text"
            name="name"
            maxLength={100}
            value={inlineForm.name}
            onChange={handleInlineFormChange}
            placeholder="예: KOREA Won | 양산가 | 연간단가"
            className="flex-1 px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none"
          />
        </div>

        {/* 💵 오직 통화코드(currency_codes)일 때만 나타나는 특수 DB 필드 추가 제어 */}
        {activeForm === "currency" && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-24 text-slate-600 font-medium">symbol</span>
              <input
                type="text"
                name="symbol"
                maxLength={10}
                value={inlineForm.symbol}
                onChange={handleInlineFormChange}
                placeholder="예: ₩"
                className="flex-1 px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-slate-600 font-medium">decimal_places</span>
              <input
                type="number"
                name="decimal_places"
                value={inlineForm.decimal_places}
                onChange={handleInlineFormChange}
                placeholder="2"
                className="flex-1 px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none"
              />
            </div>
          </>
        )}

        {/* 가변 인풋 C: 설명 영역 (모두 수용하는 데이터 모델링 보장) */}
        <div className="flex items-start gap-2">
          <span className="w-24 text-slate-600 font-medium pt-1">description</span>
          <textarea
            name="description"
            rows={2}
            value={inlineForm.description}
            onChange={handleInlineFormChange}
            placeholder="상세 부가 정보 기재"
            className="flex-1 px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-800 resize-none text-xs focus:outline-none"
          />
        </div>

        {/* 액션 제어 버튼 (is_active 항목 제외 완료) */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveInlineCode}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition"
          >
            등록
          </button>
          <button
            type="button"
            onClick={() => setActiveForm(null)}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition"
          >
            취소
          </button>
        </div>
      </div>
    );
  }
}
