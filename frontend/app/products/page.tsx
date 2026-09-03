'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // ⭐ Render 서버 API 그대로 유지
  useEffect(() => {
    fetch('https://accelinkerp.onrender.com/api/products/')
      .then((res) => {
        if (!res.ok) throw new Error('서버 응답 에러');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('데이터 통신 에러:', err);
        setErrorMsg('서버와 통신 중 문제가 발생했습니다.');
        setLoading(false);
      });
  }, []);

  // ⭐ 전체 필드 검색 기능
  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setFiltered(products);
      return;
    }

    const lower = value.toLowerCase();

    const result = products.filter((p) => {
      return (
        (p.part_number || '').toLowerCase().includes(lower) ||
        (p.category_value || '').toLowerCase().includes(lower) ||
        (p.package_value || '').toLowerCase().includes(lower) ||
        (p.datarate_value || '').toLowerCase().includes(lower) ||
        (p.temp_value || '').toLowerCase().includes(lower) ||
        (p.distance_value || '').toLowerCase().includes(lower) ||
        (p.wavelength_value || '').toLowerCase().includes(lower) ||
        (p.remarks || '').toLowerCase().includes(lower)
      );
    });

    setFiltered(result);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <h1 className="font-bold text-base text-slate-800">제품 리스트</h1>

        {/* 상단 신규 버튼 */}
        <Link href="/products/new">
          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg active:bg-blue-700">
            신규 등록
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

        {/* ⭐ 검색창 + 검색 시에만 나타나는 신규 버튼 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="전체 필드 검색"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />

          {/* 검색어가 있을 때만 표시 */}
          {search.trim() !== '' && (
            <Link href="/products/new">
              <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg active:bg-blue-700">
                신규
              </button>
            </Link>
          )}
        </div>

        {/* 제품 리스트 */}
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-4">
            검색 결과가 없습니다.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.product_id}
              className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm"
            >
              <div className="font-bold text-sm text-slate-800">
                {p.part_number}
              </div>

              <div className="text-xs text-slate-600 mt-1">
                {p.category_value} / {p.package_value} / {p.datarate_value}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                {p.temp_value} / {p.distance_value} / {p.wavelength_value}
              </div>

              {p.remarks && (
                <div className="text-xs text-slate-400 mt-1">
                  비고: {p.remarks}
                </div>
              )}

              {/* ⭐ 수정 버튼 (Link 적용) */}
              <div className="flex gap-2 mt-3">
                <Link href={`/products/${p.product_id}/edit`} className="flex-1">
                  <button className="w-full py-1.5 bg-slate-200 text-slate-700 text-xs rounded-lg active:bg-slate-300">
                    수정
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
