import { type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** 必須項目であることを示す */
  required?: boolean;
}

/**
 * フォームラベル
 * input / textarea と組み合わせて使用します
 */
export function Label({
  className,
  children,
  required = false,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-foreground mb-1.5",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-accent" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
