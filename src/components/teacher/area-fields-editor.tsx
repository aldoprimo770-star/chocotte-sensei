"use client";

import { PREFECTURES } from "@/constants/prefectures";
import { getCitiesByPrefecture } from "@/constants/cities-by-prefecture";

export type AreaFieldValue = {
  prefecture: string;
  city: string;
};

/**
 * 対応地域の編集（都道府県 → 市町村の連動セレクト）
 * 複数地域を追加でき、市町村未選択は「都道府県全域」として保存する。
 */
export function AreaFieldsEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: AreaFieldValue[];
  onChange: (next: AreaFieldValue[]) => void;
  disabled?: boolean;
}) {
  function updateRow(index: number, patch: Partial<AreaFieldValue>) {
    const next = value.map((row, i) => {
      if (i !== index) return row;
      const merged = { ...row, ...patch };
      // 都道府県が変わったら市町村をリセット
      if (patch.prefecture !== undefined && patch.prefecture !== row.prefecture) {
        merged.city = "";
      }
      return merged;
    });
    onChange(next);
  }

  function addRow() {
    onChange([...value, { prefecture: "", city: "" }]);
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-muted">
          対応地域が未設定です。「地域を追加」から登録してください。
        </p>
      )}

      {value.map((row, index) => {
        const cities = row.prefecture
          ? getCitiesByPrefecture(row.prefecture)
          : [];

        return (
          <div
            key={index}
            className="grid gap-2 rounded-xl border border-border bg-surface/50 p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted">
                都道府県
              </span>
              <select
                value={row.prefecture}
                disabled={disabled}
                onChange={(e) =>
                  updateRow(index, { prefecture: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-muted">
                市町村
              </span>
              <select
                value={row.city}
                disabled={disabled || !row.prefecture}
                onChange={(e) => updateRow(index, { city: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="">都道府県全域</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeRow(index)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-background disabled:opacity-50"
              >
                削除
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        disabled={disabled}
        onClick={addRow}
        className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-light disabled:opacity-50"
      >
        ＋ 地域を追加
      </button>
    </div>
  );
}
