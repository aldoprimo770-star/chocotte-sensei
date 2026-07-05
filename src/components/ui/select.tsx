import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  /** エラー状態（バリデーション失敗時） */
  hasError?: boolean;
}

/**
 * 共通セレクトボックス（単一選択・都道府県選択などに使用）
 * option は children として渡します。
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, hasError = false, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border bg-background px-4 text-base text-foreground",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-accent focus:ring-accent"
            : "border-border hover:border-primary/40",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
