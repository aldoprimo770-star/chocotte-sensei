import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { ButtonSize, ButtonVariant } from "@/types";

/** バリエーションごとのスタイル定義 */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm",
  secondary:
    "bg-secondary text-foreground hover:bg-secondary-hover shadow-sm",
  accent:
    "bg-accent text-white hover:bg-accent-hover shadow-sm",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary-light",
  ghost:
    "text-foreground bg-transparent hover:bg-surface",
};

/** サイズごとのスタイル定義 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-lg",
  md: "h-11 px-6 text-base rounded-xl",
  lg: "h-12 px-8 text-lg rounded-xl",
};

/** ボタン共通の見た目クラスを生成 */
function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 見た目のバリエーション */
  variant?: ButtonVariant;
  /** ボタンのサイズ */
  size?: ButtonSize;
  /** 幅100%に広げる */
  fullWidth?: boolean;
  /** 指定すると Link として描画（ページ遷移用） */
  href?: string;
}

/**
 * 共通ボタンコンポーネント
 *
 * サイト全体で統一されたボタンスタイルを提供します。
 * variant で色、size で大きさを切り替えられます。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled,
      type = "button",
      href,
      children,
      ...props
    },
    ref,
  ) {
    const classes = getButtonClassName(variant, size, fullWidth, className);

    // href がある場合は Link として描画
    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);
