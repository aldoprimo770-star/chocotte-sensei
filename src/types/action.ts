/**
 * Server Action の共通戻り値型
 *
 * フォーム系のアクションで使い回し、成功/失敗と
 * フィールド単位のエラー（RHFのsetErrorに反映）を返します。
 */
export type FormActionResult =
  | { success: true }
  | {
      success: false;
      /** 画面全体に表示するエラーメッセージ */
      error?: string;
      /** フィールド名 → エラーメッセージ */
      fieldErrors?: Record<string, string>;
    };
