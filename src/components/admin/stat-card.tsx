/**
 * 統計カード（管理ダッシュボード用）
 * 数値を大きく見せ、1人運営でも状況をひと目で把握できるようにします。
 */
export function StatCard({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: number;
  unit?: string;
  /** 注意を促したい指標（承認待ち・未対応など）をオレンジで強調 */
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 flex items-baseline gap-1">
        <span
          className={`text-3xl font-bold ${
            highlight && value > 0 ? "text-primary" : "text-gray-800"
          }`}
        >
          {value.toLocaleString()}
        </span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </p>
    </div>
  );
}
