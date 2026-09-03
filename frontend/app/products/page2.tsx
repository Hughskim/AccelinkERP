'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Product {
  product_id: number;
  part_number: string;
  is_active: boolean | null;
  remarks: string | null;
  category_value: string | null;
  datarate_value: string | null;
  package_value: string | null;
  distance_value: string | null;
  wavelength_value: string | null;
  temp_value: string | null;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // 전 필드 검색
  useEffect(() => {
    const lower = searchText.toLowerCase();

    const result = products.filter((p) => {
      return (
        p.part_number?.toLowerCase().includes(lower) ||
        p.category_value?.toLowerCase().includes(lower) ||
        p.package_value?.toLowerCase().includes(lower) ||
        p.datarate_value?.toLowerCase().includes(lower) ||
        p.temp_value?.toLowerCase().includes(lower) ||
        p.distance_value?.toLowerCase().includes(lower) ||
        p.wavelength_value?.toLowerCase().includes(lower) ||
        p.remarks?.toLowerCase().includes(lower)
      );
    });

    setFiltered(result);
  }, [searchText, products]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-500 active:text-slate-800 p-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-lg text-slate-800">제품 마스터 관리</h1>
      </header>

      {/* 검색창 + 신규 버튼 */}
      <div className="p-4 max-w-md mx-auto flex gap-2">
        <input
          type="text"
          placeholder="🔍 제품 검색 (모든 필드)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* 검색어가 있을 때만 신규 버튼 표시 */}
        {searchText.trim().length > 0 && (
          <button className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg">
            신규
          </button>
        )}
      </div>

      {/* 본문 */}
      <main className="p-4 space-y-3 max-w-md mx-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium animate-pulse">
            실시간 데이터베이스 연결 중...
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center text-xs text-rose-700">
            ⚠️ 통신 오류: {errorMsg}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            검색 결과가 없습니다.
            <div className="mt-3">
              <button className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg">
                신규 제품 등록
              </button>
            </div>
          </div>
        ) : (
          filtered.map((product) => (
            <div 
              key={product.product_id}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors"
            >

              {/* 1줄: 파트넘버 + 활성/비활성 */}
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-800">
                  {product.part_number}
                </h4>

                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {product.is_active ? '활성' : '비활성'}
                </span>
              </div>

              {/* 2줄: Category, Type, Temp */}
              <div className="text-xs text-slate-600 mt-1">
                Cat: {product.category_value || '-'}
                {' '}| Type: {product.package_value || '-'} ({product.datarate_value || '-'})
                {' '}| Temp: {product.temp_value || '-'}
              </div>

              {/* 3줄: Distance, Wavelength, Remarks */}
              <div className="text-xs text-slate-600">
                Dist: {product.distance_value || '-'}
                {' '}| Wave: {product.wavelength_value || '-'}
                {product.remarks && (
                  <> {' '}| 📝 {product.remarks}</>
                )}
              </div>

              <button className="text-blue-600 text-xs mt-2 font-medium">
                수정
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
