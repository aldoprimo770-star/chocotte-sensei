import type { Metadata } from "next";
import { getOperatorLegalInfoAdmin } from "@/lib/settings/operator-legal";
import { LegalOperatorForm } from "./legal-operator-form";

export const metadata: Metadata = { title: "特商法・事業者情報" };

/** 特定商取引法の事業者情報（管理者専用） */
export default async function AdminLegalOperatorPage() {
  const initial = await getOperatorLegalInfoAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">特商法・事業者情報</h1>
        <p className="mt-1 text-sm text-gray-500">
          特定商取引法に基づく表記・利用規約・プライバシーポリシーに反映されます。
          住所と電話番号は、初期値では一般公開せず「請求時開示」です。
        </p>
      </div>

      <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6">
        <LegalOperatorForm initial={initial} />
      </div>
    </div>
  );
}
