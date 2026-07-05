import { Card, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 購入済みの連絡先表示（サーバーコンポーネント・表示専用）
 *
 * 呼び出し側で「購入が COMPLETED かつ本人」であることを確認した上で
 * レンダリングしてください。LINE ID は仕様により表示しません。
 */
export function ContactDetails({
  displayName,
  email,
  phone,
  websiteUrl,
  snsUrl,
}: {
  displayName: string;
  email: string;
  phone: string | null;
  websiteUrl: string | null;
  snsUrl: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>連絡先</CardTitle>
      </CardHeader>
      <dl className="space-y-4 text-sm">
        <Row label="表示名">{displayName}</Row>
        <Row label="メールアドレス">
          <a href={`mailto:${email}`} className="text-primary hover:underline">
            {email}
          </a>
        </Row>
        {phone && (
          <Row label="電話番号">
            <a href={`tel:${phone}`} className="text-primary hover:underline">
              {phone}
            </a>
          </Row>
        )}
        {websiteUrl && (
          <Row label="ホームページ">
            <ExternalLink href={websiteUrl}>{websiteUrl}</ExternalLink>
          </Row>
        )}
        {snsUrl && (
          <Row label="SNS">
            <ExternalLink href={snsUrl}>{snsUrl}</ExternalLink>
          </Row>
        )}
      </dl>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <dt className="w-28 shrink-0 font-medium text-muted">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-foreground">{children}</dd>
    </div>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {children}
    </a>
  );
}
