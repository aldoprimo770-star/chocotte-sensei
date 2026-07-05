/**
 * 静的ページ共通のページヘッダー（見出し帯）
 * 白基調＋淡いオレンジのグラデーションで統一感を出します。
 */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-gradient-to-b from-primary-light to-surface px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm text-muted sm:text-base">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
