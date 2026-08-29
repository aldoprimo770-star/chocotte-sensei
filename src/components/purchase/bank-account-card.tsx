import type { BankAccountInfo } from "@/constants/bank-transfer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

/** 振込先口座の表示（購入画面・購入詳細用） */
export function BankAccountCard({
  account,
  amount,
  teacherName,
  deadlineLabel,
}: {
  account: BankAccountInfo;
  amount: number;
  teacherName: string;
  deadlineLabel: string;
}) {
  return (
    <Card className="mb-6 border-primary/30">
      <CardHeader>
        <CardTitle>銀行振込で購入する</CardTitle>
      </CardHeader>

      <dl className="space-y-3 text-sm">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-muted">先生</dt>
          <dd className="font-medium text-foreground">{teacherName}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="text-muted">お振込金額</dt>
          <dd className="text-2xl font-bold text-primary">
            ¥{amount.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-muted">（税込）</span>
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl border border-border bg-surface/60 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">振込先口座</p>
        <dl className="space-y-2 text-sm">
          <Row label="銀行名" value={account.bankName} />
          <Row label="支店名" value={account.branchName} />
          <Row label="口座種別" value={account.accountType} />
          <Row label="口座番号" value={account.accountNumber} mono />
          <Row label="口座名義" value={account.accountHolder} />
        </dl>
      </div>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
        <li>
          振込期限: <span className="font-medium text-foreground">{deadlineLabel}</span>
          までにお振込みください。
        </li>
        <li>振込手数料は購入者のご負担となります。</li>
        <li>
          金額を間違えないよう、表示の金額をそのままお振込みください。
        </li>
        {account.remitterNote ? <li>{account.remitterNote}</li> : null}
      </ul>
    </Card>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd
        className={`text-foreground ${mono ? "font-mono tracking-wide" : "font-medium"}`}
      >
        {value}
      </dd>
    </div>
  );
}
