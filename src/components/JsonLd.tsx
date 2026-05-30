// Emits a schema.org JSON-LD <script> in the document. Server component — runs at
// SSR/ISR so crawlers receive structured data in the initial HTML.
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
