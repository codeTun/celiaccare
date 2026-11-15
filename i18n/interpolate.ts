/**
 * Replace {placeholders} in a translated sentence.
 * interpolate("Vérifié le {date}", { date: "12 nov. 2026" }) -> "Vérifié le 12 nov. 2026"
 */
export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
