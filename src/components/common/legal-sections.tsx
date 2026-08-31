/** 法的文書の1セクション（見出し + 段落 + 任意の箇条書き） */
export interface LegalSection {
  heading: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
  /** 箇条書きの後に続ける段落 */
  paragraphsAfter?: readonly string[];
}

/**
 * 利用規約・プライバシーポリシーなどの本文表示用コンポーネント
 */
export function LegalSections({
  sections,
  updatedAt,
  version,
}: {
  sections: readonly LegalSection[];
  updatedAt?: string;
  version?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {(updatedAt || version) && (
        <p className="mb-8 text-right text-sm text-muted">
          {updatedAt ? `制定・改定日：${updatedAt}` : null}
          {updatedAt && version ? " ／ " : null}
          {version ? `版：${version}` : null}
        </p>
      )}
      <div className="space-y-10">
        {sections.map((section, index) => (
          <section key={section.heading} id={`section-${index + 1}`}>
            <h2 className="mb-3 text-lg font-bold text-foreground">
              {index + 1}. {section.heading}
            </h2>
            <div className="space-y-2">
              {section.paragraphs?.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              {section.items && section.items.length > 0 ? (
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.paragraphsAfter?.map((p) => (
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
