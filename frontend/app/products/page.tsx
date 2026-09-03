'use client';

import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Package, 
  Cpu, 
  Milestone, 
  Radio, 
  Thermometer, 
  Tag 
} from 'lucide-react';
import Link from 'next/link';

// 실제 product_master 테이블 컬럼 구조와 100% 일치하는 프론트엔드 규격 정의
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
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 화면이 켜지는 순간 Render 백엔드로 데이터를 요청
  useEffect(() => {
    fetch('https://accelinkerp.onrender.com/api/products/')
      .then((res) => {
        if (!res.ok) throw new Error('서버 응답 에러');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('데이터 통신 에러:', err);
        setErrorMsg('서버와 통신 중 문제가 발생했습니다.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-500 active:text-slate-800 p-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-lg text-slate-800">제품 마스터 관리</h1>
      </header>

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
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            등록된 제품 정보가 없습니다.
          </div>
        ) : (
          products.map((product) => (
            <div 
              key={product.product_id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 active:bg-slate-50 transition-colors"
            >
              
              {/* 상단: ID + Part Number */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                    <Package size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                      ID: {product.product_id}
                    </h3>
                    <h4 className="font-extrabold text-base text-slate-800">
                      {product.part_number}
                    </h4>
                  </div>
                </div>

                {/* 활성/비활성 */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    product.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {product.is_active ? '활성' : '비활성'}
                </span>
              </div>

              {/* 중단: 공통 코드 매핑 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu size={12} className="text-slate-400" />
                  <span className="font-medium text-slate-400">Type:</span>
                  <span className="font-bold text-slate-700">
                    {product.package_value || '-'} ({product.datarate_value || '-'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Radio size={12} className="text-slate-400" />
                  <span className="font-medium text-slate-400">Wave:</span>
                  <span className="font-bold text-slate-700">
                    {product.wavelength_value || '-'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Milestone size={12} className="text-slate-400" />
                  <span className="font-medium text-slate-400">Dist:</span>
                  <span className="font-bold text-slate-700">
                    {product.distance_value || '-'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Thermometer size={12} className="text-slate-400" />
                  <span className="font-medium text-slate-400">Temp:</span>
                  <span className="font-bold text-slate-700">
                    {product.temp_value || '-'}
                  </span>
                </div>
              </div>

              {/* 카테고리 태그 */}
              {product.category_value && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Tag size={10} className="text-slate-400" />
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
                    {product.category_value}
                  </span>
                </div>
              )}

              {/* 비고 */}
              {product.remarks && (
                <p className="bg-slate-50 text-[11px] text-slate-400 p-2 rounded-lg border border-slate-100 italic">
                  📝 {product.remarks}
                </p>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
