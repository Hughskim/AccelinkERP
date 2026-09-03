import Link from 'next/link';
import React from 'react';
// 스마트폰 화면에서 사용할 아이콘 팩들을 가져옵니다 (Lucide 아이콘집)
import { 
  Users, 
  Package, 
  DollarSign, 
  FileText, 
  Activity, 
  ShieldAlert,
  Layers
} from 'lucide-react';

export default function MobileDashboard() {
  return (
    // 전체 배경 화면 설정 (모바일 앱 느낌을 주는 눈이 편안한 Slate 톤)
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      
      {/* 📱 상단 고정 헤더 영역 */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="font-extrabold text-xl tracking-tight text-blue-600">
          Accelink<span className="text-slate-800">ERP</span>
        </h1>
        {/* 모바일 가동 상태를 나타내는 초록색 실시간 불빛 인디케이터 */}
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          시스템 정상
        </div>
      </header>

      {/* 📊 메인 본문 콘텐츠 영역 */}
      <main className="p-4 space-y-6 max-w-md mx-auto">
        
        {/* 요약 비즈니스 브리핑 세션 */}
        <div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Accelink Enterprise</p>
          <h2 className="text-2xl font-bold text-slate-800">모바일 워크스페이스</h2>
        </div>

        {/* 📦 스마트폰 전용 카드형 메인 메뉴 리스트 */}
        <div className="grid grid-cols-1 gap-3">
          
          {/* 1. 고객사 관리 카드 */}
          <Link href="/customers" className="block">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">고객 관리 (Customer)</h3>
                <p className="text-slate-400 text-xs">고객사 마스터 및 주소록 관리</p>
              </div>
            </div>
            <span className="text-slate-300 font-bold text-lg">❯</span>
          </div>
          </Link>
          {/* 2. 제품 마스터 관리 카드 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">제품 관리 (Product)</h3>
                <p className="text-slate-400 text-xs">광모듈 사양 및 공통 코드 사전</p>
              </div>
            </div>
            <span className="text-slate-300 font-bold text-lg">❯</span>
          </div>

          {/* 3. 가격/단가 관리 카드 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">단가 관리 (Price Log)</h3>
                <p className="text-slate-400 text-xs">고객사별 가격 변동 추이 이력</p>
              </div>
            </div>
            <span className="text-slate-300 font-bold text-lg">❯</span>
          </div>

          {/* 4. PO / 수주 / 백로그 관리 카드 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">수주 및 납기 (PO & Backlog)</h3>
                <p className="text-slate-400 text-xs">구매 주문 잔량 및 분할 선적 계획</p>
              </div>
            </div>
            <span className="text-slate-300 font-bold text-lg">❯</span>
          </div>

          {/* 5. 수금 및 정산 관리 카드 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-100 p-3 rounded-xl text-cyan-600">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">정산 및 수금 (Payment)</h3>
                <p className="text-slate-400 text-xs">수금액 매칭 및 커미션 정산서</p>
              </div>
            </div>
            <span className="text-slate-300 font-bold text-lg">❯</span>
          </div>

          {/* 6. RMA 품질 관리 카드 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">반품 및 RMA 관리 (RMA)</h3>
                <p className="text-slate-400 text-xs">불량품 입고, 수리 비용, 리턴 추적</p>
              </div>
            </div>
            <span className="text-slate-300 font-bold text-lg">❯</span>
          </div>

          {/* 7. 샘플 관리 카드 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between active:bg-slate-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                <Layers size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">샘플 출하 (Sample Track)</h3>
                <p className="text-slate-400 text-xs">테스트용 샘플 출하 및 승인 현황</p>
              </div>
            </div>
            <span className="text-slate-300 font-bold text-lg">❯</span>
          </div>

        </div>

      </main>
    </div>
  );
}
