'use client';

import React, { useState } from "react";
import Link from "next/link";

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
    if (isNaN(date.getTime())) return dateString; // 날짜 파싱 실패 시 원본 문자열 반환
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  // ⭐ 검색 실행 함수
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
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            검색
          </button>
        </div>

        {/* 로딩 상태창 */}
        {loading && <div className="text-center text-slate-500 text-sm mt-4">로딩 중...</div>}

        {/* 결과 없음 */}
        {!loading && results.length === 0 && keyword.trim() !== "" && (
          <div className="text-center text-slate-500 text-sm mt-4">검색된 제품이 없습니다.</div>
        )}

        {/* 📋 제품 + 가격 리스트 결과 피드 */}
        {!loading &&
          results.map(({ product, prices }) => {
            const hasPrice = prices && prices.length > 0;

            return (
              <div
                key={product.product_id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-left space-y-3"
              >
                {/* 1️⃣ 제품 정보 영역 (+ 우측 신규 추가 버튼 상시 배치 절차 구현) */}
                <div className="border-b border-slate-100 pb-2 flex items-start justify-between gap-2">
                  <div>
                    {/* 첫째줄: part_number */}
                    <div className="font-bold text-sm text-slate-800">{product.part_number}</div>
                    {/* 둘째줄: 스펙값 */}
                    <div className="text-xs text-slate-500 mt-0.5">
                      {product.datarate_value || "-"} / {product.package_value || "-"} / {product.distance_value || "-"}
                    </div>
                  </div>

                  {/* 독립 버튼으로 항상 새 고객 가격 등록 가능 */}
                  <Link href={`/prices/create?product_id=${product.product_id}`}>
                    <button className="shrink-0 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 text-[10px] font-bold rounded border border-slate-200 transition">
                      + 새 가격 등록
                    </button>
                  </Link>
                </div>

                {/* 2️⃣ 가격 내역 리스트 영역 */}
                <div>
                  {!hasPrice ? (
                    <div className="text-center bg-slate-50 py-4 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                      등록된 고객별 가격 정보가 없습니다. 상단의 버튼을 눌러 첫 가격을 등록해 주세요.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prices.map((price) => (
                        <div
                          key={price.price_id}
                          className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 space-y-1"
                        >
                          {/* 첫줄: 백엔드 DB에서 조인하여 내려준 순수 customer_name 출력 */}
                          <div className="text-xs font-bold text-slate-800">
                            고객명: <span className="text-blue-600">{price.customer_name}</span>
                          </div>

                          {/* 둘째줄: 단가 / 견적가 / 승인일 + 상세보기 */}
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

                            <Link
                              href={`/prices/${price.price_id}`}
                              className="text-[11px] text-blue-600 hover:underline font-medium"
                            >
                              상세보기
                            </Link>
                          </div>
                        </div>
                      ))}
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
