"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { SORT_OPTIONS } from "@/constants/teacher";

/**
 * 並び替えセレクト（クライアントコンポーネント）
 *
 * 現在の検索条件（URL）を保持したまま sort だけを変更します。
 * 並び替え変更時はページを1に戻します。
 * basePath を変えることで検索・カテゴリー・地域の各ページで再利用できます。
 */
export function SortSelect({
  current,
  basePath = "/teachers",
}: {
  current: string;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;

    if (value === "new") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page"); // 並び替え時は先頭ページへ

    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <Select
      aria-label="並び替え"
      value={current}
      onChange={handleChange}
      className="h-10 w-auto text-sm"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
