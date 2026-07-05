import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS のクラス名を安全に結合するユーティリティ。
 * 条件付きクラスと重複解決を1つの関数にまとめています。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
