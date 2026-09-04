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
        `https://accelinkerp.onrender.com/api/prices/?keyword=${encodeURIComponent(
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

        {/* 제품 리스트로 이동 (옵션) */}
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
            placeholder="제품명 또는 제품코드 검색"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg active:bg-blue-700"
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

        {/* 제품 + 가격 리스트 */}
        {!loading &&
          results.map(({ product, prices }) => (
            <div
              key={product.product_id}
              className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm"
            >
              {/* 제품 정보 */}
              <div className="font-bold text-sm text-slate-800">
                {product.part_number}
              </div>

              <div className="text-xs text-slate-600 mt-1">
                {product.category_value} / {product.package_value} /{" "}
                {product.datarate_value}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                {product.temp_value} / {product.distance_value} /{" "}
                {product.wavelength_value}
              </div>

              {product.remarks && (
                <div className="text-xs text-slate-400 mt-1">
                  비고: {product.remarks}
                </div>
              )}

              {/* 가격 리스트 */}
              <div className="mt-3 space-y-2">
                {prices.length === 0 ? (
                  <div className="text-xs text-slate-500">
                    등록된 가격이 없습니다.
                  </div>
                ) : (
                  prices.map((price) => (
                    <div
                      key={price.price_id}
                      className="border border-slate-200 rounded-lg p-2 bg-slate-50"
                    >
                      <div className="text-xs text-slate-700 space-y-0.5">
                        <p>고객 ID: {price.customer_id}</p>
                        <p>통화: {price.currency_code || "-"}</p>
                        <p>단가: {price.price_value}</p>
                        {price.price_quote && (
                          <p>견적 단가: {price.price_quote}</p>
                        )}
                        <p>활성: {price.is_active ? "Yes" : "No"}</p>
                      </div>

                      <Link
                        href={`/prices/${price.price_id}`}
                        className="block text-right text-blue-600 text-xs underline mt-1"
                      >
                        상세보기
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
