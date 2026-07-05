import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** エラー状態（バリデーション失敗時） */
  hasError?: boolean;
}

/**
 * 共通テキストエリア（自己紹介・レッスン内容など長文入力用）
 * React Hook Form と組み合わせる際は ref をそのまま渡せます。
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, hasError = false, rows = 5, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-xl border bg-background px-4 py-3 text-base text-foreground",
          "placeholder:text-muted/60",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-accent focus:ring-accent"
            : "border-border hover:border-primary/40",
          className,
        )}
        {...props}
      />
    );
  },
);
