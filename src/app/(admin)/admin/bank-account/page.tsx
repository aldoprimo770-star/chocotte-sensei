import type { Metadata } from "next";
import { getBankAccountInfo } from "@/lib/settings/bank-account";
import { BankAccountForm } from "./bank-account-form";

export const metadata: Metadata = { title: "振込先口座" };

/** 銀行振込の振込先口座設定（管理者専用） */
export default async function AdminBankAccountPage() {
  const account = await getBankAccountInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">振込先口座</h1>
        <p className="mt-1 text-sm text-gray-500">
          連絡先購入の振込先です。変更後の口座は、今後の新規購入に使用されます。
        </p>
      </div>

      <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6">
        <BankAccountForm initial={account} />
      </div>
    </div>
  );
}
