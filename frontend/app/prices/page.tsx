'use client';

import React, { useState } from "react";
import Link from "next/link";

// 🏢 고객 ID를 실제 기업/고객명으로 매핑해주는 임시 가상 테이블
// (추후 백엔드 API가 customer_name을 제공하면 이 객체 없이 price.customer_name을 바로 사용하면 됩니다.)
const customerMap: Record<number | string, string> = {
  1: "SK Telecom",
  2: "KT",
  3: "LG U+",
  4: "Dasan", // 요청하신 예시: ID가 4일 때 Dasan으로 매핑
  5: "Samsung",
};

export default function PriceSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<
    { product: any; prices: any[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🗓️ 승인일 날짜 포맷 변경 함수 (YYYY-MM-DD -> YYYY/MM/DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  // ⭐ 검색 실행
  const handleSearch = async () => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(
        `https://accelinkerp.onrender.com/api/prices/search?keyword=${encodeURIComponent(
          keyword
        )}`
      );

      if (!res.ok) throw new Error("서버 응답 에러");

      const data = await res.json();
      setResults(data.products || []);
    } catch (err) {
      console.error("데이터 통신 에러:", err);
      setErrorMsg("서버와 통신 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <h1 className="font-bold text-base text-slate-800">가격 검색</h1>

        <Link href="/products">
          <button className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs rounded-lg active:bg-slate-300">
            제품 리스트
          </button>
        </Link>
      </header>

      <main className="p-4 space-y-3 max-w-md mx-auto">
        {/* 에러 메시지 */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-xs text-rose-700">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 검색창 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="제품명 또는 제품코드 검색"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            검색
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center text-slate-500 text-sm mt-4">
            로딩 중...
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!loading && results.length === 0 && keyword.trim() !== "" && (
          <div className="text-center text-slate-500 text-sm mt-4">
            검색된 제품이 없습니다.
          </div>
        )}

        {/* 📋 제품 + 가격 리스트 검색 결과 */}
        {!loading &&
          results.map(({ product, prices }) => {
            const hasPrice = prices && prices.length > 0;

            return (
              <div
                key={product.product_id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left space-y-3"
              >
                {/* 1️⃣ 제품 정보 영역 (셋째줄 제거 완료) */}
                <div className="border-b border-slate-100 pb-2">
                  {/* 첫째줄: product_master.part_number */}
                  <div className="font-bold text-sm text-slate-800">
                    {product.part_number}
                  </div>

                  {/* 둘째줄: datarate_value / package_value / distance_value */}
                  <div className="text-xs text-slate-500 mt-1">
                    {product.datarate_value || "-"} / {product.package_value || "-"} / {product.distance_value || "-"}
                  </div>
                  
                  {/* 비고 설명 (있을 경우에만 뱃지나 작게 표시하여 압축) */}
                  {product.remarks && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      비고: {product.remarks}
                    </div>
                  )}
                </div>

                {/* 2️⃣ 가격 리스트 영역 */}
                <div>
                  {!hasPrice ? (
                    // ❌ 가격 정보가 없는 경우: 경고 문구 + 옆에 [가격 등록] 버튼 배치
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                      <span className="text-xs text-slate-400">등록된 가격이 없습니다.</span>
                      <Link href={`/prices/create?product_id=${product.product_id}`}>
                        <button className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded transition">
                          가격 등록
                        </button>
                      </Link>
                    </div>
                  ) : (
                    // ⭕ 가격 정보가 있는 경우
                    <div className="space-y-2">
                      {prices.map((price) => {
                        // customerMap에 ID가 존재하면 해당 이름을 쓰고, 없으면 기존 ID 숫자를 백업 노출
                        const resolvedCustomerName = price.customer_name || customerMap[price.customer_id] || `ID ${price.customer_id}`;

                        return (
                          <div
                            key={price.price_id}
                            className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 space-y-1"
                          >
                            {/* 첫줄 : 실제 매핑된 고객명 표시 */}
                            <div className="text-xs font-bold text-slate-800">
                              고객명: <span className="text-blue-600">{resolvedCustomerName}</span>
                            </div>

                            {/* 둘째줄 : 단가 / 견적가 / 승인일 통합 표시 + 상세보기 우측 축소 결합 */}
                            <div className="text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-x-2">
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                                <span>
                                  단가: <strong className="text-slate-800">{price.currency_code || 'USD'} {price.price_value ?? "-"}</strong>
                                </span>
                                <span>|</span>
                                <span>
                                  견적가: <strong className="text-slate-800">{price.price_quote ? `${price.currency_code || 'USD'} ${price.price_quote}` : "-"}</strong>
                                </span>
                                <span>|</span>
                                <span>
                                  승인일: <strong className="text-slate-800">{formatDate(price.price_date)}</strong>
                                </span>
                              </div>

                              {/* 상세보기를 둘째줄 우측 끝단 레이아웃으로 병합하여 공간 절약 */}
                              <Link
                                href={`/prices/${price.price_id}`}
                                className="text-[11px] text-blue-600 hover:underline font-medium"
                              >
                                상세보기
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </main>
    </div>
  );
}
