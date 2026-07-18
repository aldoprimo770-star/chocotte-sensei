/** パスワード再設定トークンの有効期限（1時間） */
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** 再設定メール送信後に表示する共通メッセージ（メール存在有無を漏らさない） */
export const PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE =
  "ご入力のメールアドレス宛に、パスワード再設定の案内を送信しました。メールが届かない場合は、迷惑メールフォルダもご確認ください。";
