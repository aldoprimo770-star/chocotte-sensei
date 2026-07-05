import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * カードの外枠
 * 先生一覧やコンテンツブロックなど、情報をまとめて表示する際に使用します
 */
export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background p-6 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** カード上部（タイトル・説明エリア） */
export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

/** カードタイトル */
export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-bold text-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

/** カードの補足説明 */
export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted", className)} {...props}>
      {children}
    </p>
  );
}

/** カード本文 */
export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

/** カード下部（ボタンなどのアクションエリア） */
export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-6 flex items-center gap-3", className)} {...props}>
      {children}
    </div>
  );
}
