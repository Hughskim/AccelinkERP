'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function ProductEditPage() {
  const router = useRouter();
  const { id } = useParams(); // /products/[id]/edit

  const [showNewCode, setShowNewCode] = useState({
    category: false,
    package: false,
    datarate: false,
    temp: false,
    distance: false,
    wavelength: false,
  });

  const [newCodeValue, setNewCodeValue] = useState('');

  const [codes, setCodes] = useState({
    category: [] as string[],
    package: [] as string[],
    datarate: [] as string[],
    temp: [] as string[],
    distance: [] as string[],
    wavelength: [] as string[],
  });

  const [form, setForm] = useState({
    part_number: '',
    category_value: '',
    package_value: '',
    datarate_value: '',
    temp_value: '',
    distance_value: '',
    wavelength_value: '',
    remarks: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 임시 mock 데이터 (백엔드 API 준비되기 전까지)
  const mockProduct = {
    part_number: 'TEST-SFP-10G',
    category_value: 'Ethernet',
    package_value: 'SFP',
    datarate_value: '10G',
    temp_value: 'C-temp',
    distance_value: '10km',
    wavelength_value: '1310nm',
    remarks: '테스트 제품',
    is_active: true,
  };

  const mockCodes = {
    category: ['Ethernet', 'Telecom'],
    package: ['SFP', 'QSFP'],
    datarate: ['1G', '10G', '25G'],
    temp: ['C-temp', 'I-temp'],
    distance: ['10km', '40km'],
    wavelength: ['1310nm', '1550nm'],
  };

  useEffect(() => {
    // 나중에 백엔드 API로 교체
    setCodes(mockCodes);
    setForm(mockProduct);
    setLoading(false);
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleAddCode = (type: string) => {
    if (!newCodeValue.trim()) {
      setErrorMsg('값을 입력해주세요.');
      return;
    }

    const updated = [...(codes as any)[type], newCodeValue];

    setCodes({ ...codes, [type]: updated });
    handleChange(`${type}_value`, newCodeValue);

    setNewCodeValue('');
    setShowNewCode({ ...showNewCode, [type]: false });
  };

  const renderLine = (label: string, field: string, list: string[]) => {
    const type = field.replace('_value', '');

    return (
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap w-20">
            {label}
          </label>

          <select
            value={(form as any)[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-300"
          >
            <option value="">선택</option>
            {list.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <button
            onClick={() =>
              setShowNewCode({ ...showNewCode, [type]: !showNewCode[type] })
            }
            className="px-2 py-1.5 bg-slate-200 rounded-lg active:bg-slate-300"
          >
            <Plus size={14} />
          </button>
        </div>

        {showNewCode[type] && (
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={newCodeValue}
              onChange={(e) => setNewCodeValue(e.target.value)}
              className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-300"
              placeholder={`${label} 신규 등록`}
            />
            <button
              onClick={() => handleAddCode(type)}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg"
            >
              등록
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = () => {
    setSaving(true);

    // 나중에 백엔드 PUT API로 교체
    console.log('수정된 데이터:', form);

    setTimeout(() => {
      router.push('/products');
    }, 500);
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

      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 shadow-sm">
        <Link href="/products" className="text-slate-500 active:text-slate-800 p-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-base text-slate-800">제품 수정</h1>
      </header>

      <main className="p-4 space-y-3 max-w-md mx-auto">

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-xs text-rose-700">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Remarks */}
        <textarea
          value={form.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 h-10"
          placeholder="비고 입력"
        />

        {/* Part Number */}
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap w-20">
            Part Number
          </label>

          <input
            type="text"
            value={form.part_number}
            onChange={(e) => handleChange('part_number', e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-300"
          />
        </div>

        {renderLine('Category', 'category_value', codes.category)}
        {renderLine('Package', 'package_value', codes.package)}
        {renderLine('Datarate', 'datarate_value', codes.datarate)}
        {renderLine('Temp', 'temp_value', codes.temp)}
        {renderLine('Distance', 'distance_value', codes.distance)}
        {renderLine('Wave', 'wavelength_value', codes.wavelength)}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg active:bg-blue-700 disabled:bg-blue-300"
        >
          {saving ? '저장 중...' : '수정하기'}
        </button>

      </main>
    </div>
  );
}
