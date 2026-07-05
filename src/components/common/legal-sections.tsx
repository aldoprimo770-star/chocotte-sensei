/** 法的文書の1セクション（見出し + 段落） */
export interface LegalSection {
  heading: string;
  paragraphs: readonly string[];
}

/**
 * 利用規約・プライバシーポリシーなどの本文表示用コンポーネント
 * 見出し付きセクションを一定のタイポグラフィで並べます。
 */
export function LegalSections({
  sections,
  updatedAt,
}: {
  sections: readonly LegalSection[];
  updatedAt?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {updatedAt && (
        <p className="mb-8 text-right text-sm text-muted">
          制定日：{updatedAt}
        </p>
      )}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-lg font-bold text-foreground">
              {index + 1}. {section.heading}
            </h2>
            <div className="space-y-2">
              {section.paragraphs.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
