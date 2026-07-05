import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** チェックボックス右側に表示するラベル */
  label: string;
}

/**
 * 共通チェックボックス（複数選択・ON/OFFトグルに使用）
 * ラベルクリックでも切り替えられるよう label で包んでいます。
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, label, ...props }, ref) {
    return (
      <label
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm transition-colors",
          "hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary-light",
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="h-4 w-4 rounded border-border text-primary accent-primary focus:ring-primary"
          {...props}
        />
        <span className="text-foreground">{label}</span>
      </label>
    );
  },
);
