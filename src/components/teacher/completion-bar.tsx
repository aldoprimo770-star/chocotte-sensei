import { cn } from "@/lib/utils";

/**
 * プロフィール完成率バー
 * 「プロフィール完成率 85%」のように表示します。
 * 表示専用のためサーバー・クライアント両方から利用できます。
 */
export function CompletionBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  // 0〜100 に丸める
  const value = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          プロフィール完成率
        </span>
        <span className="text-sm font-bold text-primary">{value}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-primary-light">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
