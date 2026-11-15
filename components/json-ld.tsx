/**
 * Injects schema.org structured data in the page (read by Google).
 * "<" is escaped so the data can never close the <script> tag (XSS protection).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
