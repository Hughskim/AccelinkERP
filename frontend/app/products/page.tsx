'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Package } from 'lucide-react';

interface Product {
  product_id: number;
  product_name: string;
  product_code: string;
  category: string;
  spec: string;
  unit: string;
  remarks: string | null;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // 🔥 백엔드에서 제품 목록 불러오기
  useEffect(() => {
    fetch('https://accelinkerp.onrender.com/api/products/')
      .then((res) => {
        if (!res.ok) throw new Error('서버 응답 에러');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFiltered(data); // 초기에는 전체 목록 표시
        setLoading(false);
      })
      .catch((err) => {
        console.error('데이터 통신 에러:', err);
        setLoading(false);
      });
  }, []);

  // 🔍 검색 기능 (제품명 + 제품코드)
  useEffect(() => {
    if (query.trim() === '') {
      setFiltered(products);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        products.filter(
          (p) =>
            p.product_name.toLowerCase().includes(q) ||
            p.product_code.toLowerCase().includes(q)
        )
      );
    }
  }, [query, products]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">

      {/* 📱 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 active:text-slate-800 p-1">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg text-slate-800">제품 목록</h1>
        </div>

        {/* 🔍 검색 버튼 */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 text-slate-600 active:text-slate-800"
        >
          <Search size={20} />
        </button>
      </header>

      {/* 🔍 검색창 (토글 방식) */}
      {searchOpen && (
        <div className="p-4 bg-slate-100 border-b border-slate-300">
          <input
            type="text"
            placeholder="제품명 또는 제품코드 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300 text-sm"
          />
        </div>
      )}

      {/* 📦 제품 리스트 */}
      <main className="p-4 space-y-3 max-w-md mx-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium animate-pulse">
            실시간 데이터베이스 연결 중...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            검색 결과가 없습니다.
          </div>
        ) : (
          filtered.map((product) => (
            <div
              key={product.product_id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 active:bg-slate-50 transition-colors"
            >
              {/* 타이틀 */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <Package size={16} />
                  </div>
                  <h3 className="font-bold text-base text-slate-800">
                    {product.product_name}
                  </h3>
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">
                  {product.category}
                </span>
              </div>

              {/* 상세 정보 */}
              <div className="text-xs text-slate-500 space-y-1.5 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">코드:</span>
                  <span>{product.product_code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">규격:</span>
                  <span>{product.spec}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600">단위:</span>
                  <span>{product.unit}</span>
                </div>
              </div>

              {/* 비고 */}
              {product.remarks && (
                <p className="bg-slate-50 text-[11px] text-slate-400 p-2 rounded-lg border border-slate-100 italic">
                  💡 {product.remarks}
                </p>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
