import { interpolate } from "@/i18n/interpolate";

/**
 * Keeps a phone number or an order reference left-to-right and on one line inside a sentence,
 * even in Arabic ("+216 70 000 000" must not become "000 000 70 216+").
 * Uses the invisible Unicode marks "left-to-right isolate" … "pop directional isolate",
 * and non-breaking spaces.
 */
export function ltr(text: string) {
  return `⁦${text.replace(/ /g, " ")}⁩`;
}

/**
 * Shows a text typed by the admin (e.g. a delivery delay "24 h") with its own direction inside an
 * Arabic sentence: "24 h", not "h 24" ("first strong isolate" … "pop directional isolate").
 * In JSX, the <bdi> element does the same.
 */
export function isolate(text: string) {
  return `⁨${text}⁩`;
}

/** "1 article" / "3 articles" from { one, other } texts. */
export function countLabel(count: number, texts: { one: string; other: string }) {
  return count === 1 ? texts.one : interpolate(texts.other, { count });
}
