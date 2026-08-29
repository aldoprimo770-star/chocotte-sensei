/** 銀行振込の振込期限（購入手続き開始からの日数） */
export const BANK_TRANSFER_DEADLINE_DAYS = 7;

/** SiteSetting に保存する振込先口座のキー */
export const BANK_ACCOUNT_SETTING_KEY = "bank_transfer_account";

/** 口座種別の選択肢 */
export const BANK_ACCOUNT_TYPES = ["普通", "当座"] as const;
export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number];

/** 振込先口座情報（管理画面で編集） */
export interface BankAccountInfo {
  bankName: string;
  branchName: string;
  accountType: BankAccountType | string;
  accountNumber: string;
  accountHolder: string;
  /** 振込名義についての説明（例: カタカナで入力してください） */
  remitterNote: string;
}

/** 未設定時の空の口座情報 */
export const EMPTY_BANK_ACCOUNT: BankAccountInfo = {
  bankName: "",
  branchName: "",
  accountType: "普通",
  accountNumber: "",
  accountHolder: "",
  remitterNote:
    "振込名義は、通帳やアプリに表示されるお名前をそのまま入力してください（カタカナ可）。",
};
