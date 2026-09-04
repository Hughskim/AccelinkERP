"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PricesPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const onSearch = async () => {
    if (!keyword) return;

    const res = await fetch(`/api/prices?keyword=${keyword}`);
    const data = await res.json();
    setResults(data.products || []);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">가격 검색</h1>

      {/* 검색창 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="제품명 또는 제품코드 검색"
          className="border p-2 rounded-md w-64"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          검색
        </button>
      </div>

      {/* 검색 결과 */}
      <SearchResult results={results} />
    </div>
  );
}

function SearchResult({ results }) {
  if (!results || results.length === 0) {
    return <p className="text-gray-500">검색된 제품이 없습니다.</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {results.map(({ product, prices }) => (
        <div key={product.product_id} className="border p-4 rounded-md">
          <h3 className="font-bold">{product.product_name}</h3>
          <p className="text-sm text-gray-600">{product.product_code}</p>

          <PriceList prices={prices} />
        </div>
      ))}
    </div>
  );
}

function PriceList({ prices }) {
  if (!prices || prices.length === 0) {
    return <p className="text-gray-500 mt-2">등록된 가격이 없습니다.</p>;
  }

  return (
    <div className="mt-4 border-t pt-4 space-y-2">
      {prices.map((price) => (
        <div key={price.price_id} className="flex justify-between p-2 border rounded-md">
          <div>
            <p><strong>고객:</strong> {price.customer_id}</p>
            <p><strong>통화:</strong> {price.currency_code}</p>
            <p><strong>타입:</strong> {price.price_type}</p>
            <p><strong>정책:</strong> {price.price_policy}</p>
            <p><strong>활성:</strong> {price.is_active ? "Yes" : "No"}</p>
          </div>

          <Link
            href={`/prices/${price.price_id}`}
            className="text-blue-600 underline"
          >
            상세보기
          </Link>
        </div>
      ))}
    </div>
  );
}
