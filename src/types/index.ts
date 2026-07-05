/**
 * アプリ全体で共有する型定義
 * 各機能の型は将来、機能ごとのファイルに分割できます
 */

/** ボタンの見た目バリエーション */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "ghost";

/** ボタンのサイズ */
export type ButtonSize = "sm" | "md" | "lg";

/** 入力フィールドのサイズ */
export type InputSize = "sm" | "md" | "lg";
