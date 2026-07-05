import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { InputSize } from "@/types";

/** サイズごとのスタイル定義 */
const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-base rounded-xl",
  lg: "h-12 px-5 text-lg rounded-xl",
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 入力フィールドのサイズ */
  inputSize?: InputSize;
  /** エラー状態（バリデーション失敗時） */
  hasError?: boolean;
}

/**
 * 共通テキスト入力コンポーネント
 *
 * React Hook Form と組み合わせる際は ref をそのまま渡せます。
 * hasError を true にすると赤枠でエラーを視覚的に示します。
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className, inputSize = "md", hasError = false, type = "text", ...props },
    ref,
  ) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full border bg-background text-foreground",
          "placeholder:text-muted/60",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-accent focus:ring-accent"
            : "border-border hover:border-primary/40",
          sizeStyles[inputSize],
          className,
        )}
        {...props}
      />
    );
  },
);

/** エラーメッセージ表示用（Input の下に配置） */
export function InputErrorMessage({
  message,
  id,
}: {
  message?: string;
  id?: string;
}) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm text-accent" role="alert">
      {message}
    </p>
  );
}

/** フォームフィールド全体（ラベル + 入力 + エラー）をまとめるラッパー */
export function FormField({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-0", className)}>{children}</div>;
}
