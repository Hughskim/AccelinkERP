'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function ProductEditPage() {
  const router = useRouter();
  const { id } = useParams();

  const [showNewCode, setShowNewCode] = useState({
    category: false,
    package: false,
    datarate: false,
    temp: false,
    distance: false,
    wavelength: false,
  });

  const [newCode, setNewCode] = useState({
    category: { type: 'category', value: '', name: '' },
    package: { type: 'package', value: '', name: '' },
    datarate: { type: 'datarate', value: '', name: '' },
    temp: { type: 'temp', value: '', name: '' },
    distance: { type: 'distance', value: '', name: '' },
    wavelength: { type: 'wavelength', value: '', name: '' },
  });

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // -----------------------------
  // 코드 목록 로딩
  // -----------------------------
  const loadCodes = async () => {
    try {
      const res = await fetch('https://accelinkerp.onrender.com/api/products/codes');
      const data = await res.json();

      const formatted: any = {
        category: [],
        package: [],
        datarate: [],
        temp: [],
        distance: [],
        wavelength: [],
      };

      Object.keys(formatted).forEach((key) => {
        formatted[key] = data
          .filter((d: any) => d.code_type === key)
          .sort((a: any, b: any) => a.code_sort_order - b.code_sort_order)
          .map((d: any) => ({
            value: d.code_value,
            name: d.code_name,
            sort: d.code_sort_order,
          }));
      });

      setCodes(formatted);
    } catch (err) {
      console.error('코드 로딩 실패:', err);
    }
  };

  // -----------------------------
  // 기존 제품 데이터 로딩
  // -----------------------------
  const loadProduct = async () => {
    try {
      const res = await fetch(`https://accelinkerp.onrender.com/api/products/${id}`);
      const data = await res.json();

      setForm({
        part_number: data.part_number,
        category_value: data.category_value || '',
        package_value: data.package_value || '',
        datarate_value: data.datarate_value || '',
        temp_value: data.temp_value || '',
        distance_value: data.distance_value || '',
        wavelength_value: data.wavelength_value || '',
        remarks: data.remarks || '',
        is_active: data.is_active,
      });
    } catch (err) {
      console.error('제품 로딩 실패:', err);
      setErrorMsg('제품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
    loadProduct();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleNewCodeChange = (type: string, field: 'type' | 'value' | 'name', value: string) => {
    setNewCode({
      ...newCode,
      [type]: {
        ...newCode[type as keyof typeof newCode],
        [field]: value,
      },
    });
  };

  const handleAddCode = async (type: string) => {
    const payload = newCode[type as keyof typeof newCode];

    if (!payload.type.trim() || !payload.value.trim() || !payload.name.trim()) {
      setErrorMsg('code_type, code_value, code_name을 모두 입력해주세요.');
      return;
    }

    try {
      const currentList = codes[type as keyof typeof codes];
      const maxSort =
        currentList.length > 0 ? Math.max(...currentList.map((c: any) => c.sort)) : 0;
      const nextSortOrder = maxSort + 1;

      await fetch('https://accelinkerp.onrender.com/api/products/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_type: payload.type,
          code_value: payload.value,
          code_name: payload.name,
          code_sort_order: nextSortOrder,
        }),
      });

      setNewCode({
        ...newCode,
        [type]: { type, value: '', name: '' },
      });
      setShowNewCode({ ...showNewCode, [type]: false });

      await loadCodes();

      handleChange(`${type}_value`, payload.value);
    } catch (err) {
      setErrorMsg('코드 등록 중 오류 발생');
    }
  };

  const handleCancelNewCode = (type: string) => {
    setNewCode({
      ...newCode,
      [type]: { type, value: '', name: '' },
    });
    setShowNewCode({ ...showNewCode, [type]: false });
  };

  // -----------------------------
  // 수정 제출
  // -----------------------------
  const handleSubmit = async () => {
    if (!form.part_number.trim()) {
      setErrorMsg('Part Number는 필수입니다.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        part_number: form.part_number,
        is_active: form.is_active,
        remarks: form.remarks || null,

        category_value: form.category_value || null,
        datarate_value: form.datarate_value || null,
        package_value: form.package_value || null,
        distance_value: form.distance_value || null,
        wavelength_value: form.wavelength_value || null,
        temp_value: form.temp_value || null,
      };

      const res = await fetch(`https://accelinkerp.onrender.com/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('수정 실패');

      router.push('/products');
    } catch (err) {
      setErrorMsg('제품 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // 공통 UI 렌더링
  // -----------------------------
  const renderLine = (label: string, field: string, list: any[]) => {
    const type = field.replace('_value', '');
    const nc = newCode[type as keyof typeof newCode];

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
            {list.map((v: any) => (
              <option key={v.value} value={v.value}>
                {v.value} | {v.name}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              setShowNewCode({ ...showNewCode, [type]: !showNewCode[type as keyof typeof showNewCode] })
            }
            className="px-2 py-1.5 bg-slate-200 rounded-lg active:bg-slate-300"
          >
            <Plus size={14} />
          </button>
        </div>

        {showNewCode[type as keyof typeof showNewCode] && (
          <div className="mt-2 space-y-1 border border-slate-200 rounded-lg p-2 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 w-20">code_type</span>
              <input
                type="text"
                value={nc.type}
                onChange={(e) => handleNewCodeChange(type, 'type', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-300"
                placeholder={type}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 w-20">code_value</span>
              <input
                type="text"
                value={nc.value}
                onChange={(e) => handleNewCodeChange(type, 'value', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-300"
                placeholder="예: OSFP"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 w-20">code_name</span>
              <input
                type="text"
                value={nc.name}
                onChange={(e) => handleNewCodeChange(type, 'name', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-slate-300"
                placeholder="예: OSFP"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => handleAddCode(type)}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg"
              >
                등록
              </button>
              <button
                onClick={() => handleCancelNewCode(type)}
                className="px-3 py-1.5 bg-slate-300 text-xs rounded-lg"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    );
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

        <textarea
          value={form.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 h-10"
          placeholder="비고 입력"
        />

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
