'use client'; // 버튼 클릭이나 인터넷 통신 등 브라우저의 실시간 액션을 활성화합니다.

import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, MapPin, Globe, Phone } from 'lucide-react';
import Link from 'next/link';

// 백엔드에서 받아올 고객 데이터의 규격(Type)을 선언합니다 (TypeScript의 장점!)
interface Customer {
  customer_id: number;
  customer_name: string;
  address: string;
  country: string;
  tel: string;
  biz_type: string;
  remarks: string | null;
}

export default function CustomerListPage() {
  // 데이터를 담아둘 상태 저장소와 로딩창을 띄울 상태를 선언합니다.
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // 화면이 켜지는 순간 Render 백엔드로 데이터를 요청하는 함수를 실행합니다.
  useEffect(() => {
    fetch('https://onrender.com')
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('데이터 통신 에러:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* 📱 상단 헤더 (메인 화면으로 돌아갈 수 있는 뒤로가기 버튼 탑재) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Link href="/" className="text-slate-500 active:text-slate-800 p-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-lg text-slate-800">고객사 명단 관리</h1>
      </header>

      {/* 📊 본문 리스트 영역 */}
      <main className="p-4 space-y-3 max-w-md mx-auto">
        
        {/* 인터넷 데이터가 오고 있는 동안 보여줄 로딩창 */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium animate-pulse">
            실시간 데이터베이스 연결 중...
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            등록된 고객사 정보가 없습니다.
          </div>
        ) : (
          // 데이터가 오면 엑셀 표 대신 한 손으로 보기 편한 '모바일 카드 리스트'로 뿌려줍니다.
          customers.map((customer) => (
            <div 
              key={customer.customer_id} 
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 active:bg-slate-50 transition-colors"
            >
              {/* 타이틀 및 업종 */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <User size={16} />
                  </div>
                  <h3 className="font-bold text-base text-slate-800">{customer.customer_name}</h3>
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">
                  {customer.biz_type}
                </span>
              </div>

              {/* 세부 상세 데이터 리스트 (아이콘 결합) */}
              <div className="text-xs text-slate-500 space-y-1.5 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-slate-400" />
                  <span>{customer.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-slate-400" />
                    <span>{customer.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    <span>{customer.tel}</span>
                  </div>
                </div>
              </div>

              {/* 비고란에 글이 있다면 추가 노출 */}
              {customer.remarks && (
                <p className="bg-slate-50 text-[11px] text-slate-400 p-2 rounded-lg border border-slate-100 italic">
                  💡 {customer.remarks}
                </p>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
