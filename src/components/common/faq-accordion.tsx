import type { Faq } from "@/constants/faq";

/**
 * FAQ アコーディオン（JS不要の <details> 実装）
 * トップページ・FAQページ・先生募集ページで共通利用します。
 */
export function FaqAccordion({ items }: { items: readonly Faq[] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((faq) => (
        <details
          key={faq.q}
          className="group rounded-2xl border border-border bg-background p-5"
        >
          <summary className="cursor-pointer list-none font-medium text-foreground">
            <span className="text-primary">Q. </span>
            {faq.q}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
