import { getDb } from "@/lib/db";
import {
  BANK_ACCOUNT_SETTING_KEY,
  EMPTY_BANK_ACCOUNT,
  type BankAccountInfo,
} from "@/constants/bank-transfer";

/** JSON から口座情報を安全に読み取る */
function parseBankAccount(value: unknown): BankAccountInfo {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_BANK_ACCOUNT };
  }
  const v = value as Record<string, unknown>;
  return {
    bankName: typeof v.bankName === "string" ? v.bankName : "",
    branchName: typeof v.branchName === "string" ? v.branchName : "",
    accountType:
      typeof v.accountType === "string" && v.accountType
        ? v.accountType
        : "普通",
    accountNumber: typeof v.accountNumber === "string" ? v.accountNumber : "",
    accountHolder: typeof v.accountHolder === "string" ? v.accountHolder : "",
    remitterNote:
      typeof v.remitterNote === "string" && v.remitterNote
        ? v.remitterNote
        : EMPTY_BANK_ACCOUNT.remitterNote,
  };
}

/** 振込先口座が購入画面に出せる状態か */
export function isBankAccountConfigured(info: BankAccountInfo): boolean {
  return Boolean(
    info.bankName.trim() &&
      info.branchName.trim() &&
      info.accountType.trim() &&
      info.accountNumber.trim() &&
      info.accountHolder.trim(),
  );
}

/** 振込先口座情報を取得（未設定なら空） */
export async function getBankAccountInfo(): Promise<BankAccountInfo> {
  const row = await getDb().siteSetting.findUnique({
    where: { key: BANK_ACCOUNT_SETTING_KEY },
    select: { value: true },
  });
  return parseBankAccount(row?.value);
}

/** 振込先口座情報を保存（管理者専用・呼び出し側で権限チェック） */
export async function saveBankAccountInfo(
  info: BankAccountInfo,
): Promise<BankAccountInfo> {
  const cleaned: BankAccountInfo = {
    bankName: info.bankName.trim(),
    branchName: info.branchName.trim(),
    accountType: info.accountType.trim() || "普通",
    accountNumber: info.accountNumber.trim(),
    accountHolder: info.accountHolder.trim(),
    remitterNote:
      info.remitterNote.trim() || EMPTY_BANK_ACCOUNT.remitterNote,
  };

  await getDb().siteSetting.upsert({
    where: { key: BANK_ACCOUNT_SETTING_KEY },
    create: {
      key: BANK_ACCOUNT_SETTING_KEY,
      value: cleaned as unknown as object,
    },
    update: { value: cleaned as unknown as object },
  });

  return cleaned;
}
