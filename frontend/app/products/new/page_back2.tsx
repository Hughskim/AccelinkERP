'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductCreatePage() {
  const router = useRouter();

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
    category: [] as any[],
    package: [] as any[],
    datarate: [] as any[],
    temp: [] as any[],
    distance: [] as any[],
    wavelength: [] as any[],
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

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ⭐ 제품 코드 전체 목록 로딩
  const loadCodes = async () => {
    try {
      const res = await fetch("https://accelinkerp.onrender.com/api/products/codes");
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("코드 목록이 배열이 아님:", data);
        return;
      }

      const grouped: any = {
        category: data.filter((d: any) => d.code_type === "category"),
        package: data.filter((d: any) => d.code_type === "package"),
        datarate: data.filter((d: any) => d.code_type === "datarate"),
        temp: data.filter((d: any) => d.code_type === "temp"),
        distance: data.filter((d: any) => d.code_type === "distance"),
        wavelength: data.filter((d: any) => d.code_type === "wavelength"),
      };

      const formatted: any = {};

      for (const key of Object.keys(grouped)) {
        formatted[key] = grouped[key]
          .sort((a: any, b: any) => a.code_sort_order - b.code_sort_order)
          .map((d: any) => ({
            value: d.code_value,
            name: d.code_name,
            sort: d.code_sort_order,
          }));
      }

      setCodes(formatted);
    } catch (err) {
      console.error("코드 로딩 실패:", err);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  // ⭐ 신규 코드 등록
  const handleAddCode = async (type: string) => {
    if (!newCodeValue.trim()) {
      setErrorMsg('값을 입력해주세요.');
      return;
    }

    try {
      const currentList = codes[type];
      const maxSort = currentList.length > 0 ? Math.max(...currentList.map((c: any) => c.sort)) : 0;
      const nextSortOrder = maxSort + 1;

      await fetch("https://accelinkerp.onrender.com/api/products/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_type: type,
          code_value: newCodeValue,
          code_name: newCodeValue,
          code_sort_order: nextSortOrder,
        }),
      });

      setNewCodeValue('');
      setShowNewCode({ ...showNewCode, [type]: false });

      await loadCodes();

      handleChange(`${type}_value`, newCodeValue);
    } catch (err) {
      setErrorMsg('코드 등록 중 오류 발생');
    }
  };

  // ⭐ 드롭박스 렌더링
  const renderLine = (label: string, field: string, list: any[]) => {
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
              <option key={v.value} value={v.value}>
                {v.value} | {v.name}
              </option>
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

  const handleSubmit = async () => {
    if (!form.part_number.trim()) {
      setErrorMsg('Part Number는 필수입니다.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('https://accelinkerp.onrender.com/api/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('등록 실패');

      router.push('/products');
    } catch (err) {
      setErrorMsg('제품 등록 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">

      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 shadow-sm">
        <Link href="/products" className="text-slate-500 active:text-slate-800 p-1">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-base text-slate-800">제품 신규 등록</h1>
      </header>

      <main className="p-4 space-y-3 max-w-md mx-auto">

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-xs text-rose-700">
            ⚠️ {errorMsg}
          </div>
        )}

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
            placeholder="예: 10G-SFP-LR"
          />
        </div>

        {renderLine('Category', 'category_value', codes.category)}
        {renderLine('Package', 'package_value', codes.package)}
        {renderLine('Datarate', 'datarate_value', codes.datarate)}
        {renderLine('Temp', 'temp_value', codes.temp)}
        {renderLine('Distance', 'distance_value', codes.distance)}
        {renderLine('Wave', 'wavelength_value', codes.wavelength)}

        {/* ⭐ 비고 입력 박스 — Wavelength 아래 정상 위치 */}
        <textarea
          value={form.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 h-10"
          placeholder="비고 입력"
        />

        {/* 저장하기 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg active:bg-blue-700 disabled:bg-blue-300"
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>

      </main>
    </div>
  );
}
