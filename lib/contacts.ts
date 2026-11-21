/* ==========================================================================
   No business contact on the public site.

   CeliacCare is the only intermediary between customers and businesses (owner
   decision, 2026-11-21): no public text may give a way to reach a business
   directly (phone or WhatsApp number, e-mail address, web address, social
   network account) nor send the visitor to another shop.

   - containsContact(text): the check for forms that write public texts
     (reviews; the admin forms and the seed should use it too for descriptions,
     opening hours, verification sources...).
   - publicText / publicLabel / publicSource: the last line of defence of the
     PUBLIC fetchers (models/fetchers). A contact typed into a description, the
     opening hours, a verification source or a review never reaches the pages,
     the JSON-LD or /api. The admin keeps every text as typed.
   A text without any contact is returned unchanged.

   Plain functions (no server code, no React): usable anywhere.
   ========================================================================== */

/** Characters people put inside a phone number: space, dot, dash, non-breaking spaces. */
const PHONE_SEPARATOR = "[ .\\-\\u00a0\\u202f]?";

/**
 * Tunisian phone / WhatsApp numbers: 8 digits starting with 2 to 9, maybe after +216 or 00216,
 * written 98254255, 98 254 255 or 98.25.42.55. One kind of separator per number, so a date
 * such as 21.11.2026 is never taken for a phone number.
 */
const TUNISIAN_PHONE = new RegExp(
  String.raw`(?<![\d+])(?:\(?(?:\+|00)\s?216\)?${PHONE_SEPARATOR})?[2-9]\d` +
    String.raw`(?:(${PHONE_SEPARATOR})\d{3}\1\d{3}|(${PHONE_SEPARATOR})\d{2}\2\d{2}\2\d{2})(?!\d)`,
  "g",
);

/** Other international numbers: +33 6 12 34 56 78. */
const INTERNATIONAL_PHONE = new RegExp(String.raw`(?<![\d+])\+\s?\d{1,3}(?:${PHONE_SEPARATOR}\d){7,12}(?!\d)`, "g");

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/gu;

/** A web address with its scheme or "www.": https://…, www.glutella.tn */
const WEB_ADDRESS = /\b(?:https?:\/\/|www\.)[^\s<>"'«»]*[^\s<>"'«».,;:!?)\]]/giu;

/** Social network account: @laseine.tn */
const HANDLE = /(?<![\p{L}\p{N}_.@])@[A-Za-z0-9_][A-Za-z0-9_.]{1,28}[A-Za-z0-9_]/gu;

/** Endings of the domain names we look for (Tunisian, generic, and those of short links such as wa.me or bit.ly). */
const TLDS = "tn|com|net|org|fr|io|app|me|co|info|biz|shop|store|online|site|ly|gl|ee|page|link|tv|ma|dz|eu";

/** A host name: glutella.tn, www.laseine.tn, wa.me */
const HOST = String.raw`(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+(?:${TLDS})(?![\p{L}\p{N}\-])`;

/** The path after a host: /laseine.tn/, /21654291103 */
const PATH = String.raw`\/[^\s<>"'«»]*[^\s<>"'«».,;:!?)\]]`;

/** A domain name, maybe followed by a path (group 1 = host, group 2 = path). */
const DOMAIN_SOURCE = String.raw`(?<![\p{L}\p{N}@._\-])(${HOST})(${PATH})?`;
const DOMAIN = new RegExp(DOMAIN_SOURCE, "giu");

/** Delivery apps and marketplaces that sell the same products: never named as a place to buy. */
const OTHER_SHOPS = String.raw`Glovo|Jumia|Yassir|Talabat|Kool|Uber\s?Eats|Ileycom|Tyfano|TunisieBio`;

/** "sur tunisiebio.tn et glutenfree.tn", "sur Glovo": where public prices were read (another place to buy). */
const CHANNEL = String.raw`(?:(?:https?:\/\/)?${HOST}(?:${PATH})?|(?:${OTHER_SHOPS})\b)`;
const ON_OTHER_SHOPS = new RegExp(String.raw`\bsur\s+${CHANNEL}(?:\s*(?:,|et|&)\s*${CHANNEL})*`, "giu");

/** "(atmc.tn)": a web address given in brackets after a name. */
const DOMAIN_IN_BRACKETS = new RegExp(String.raw`\s*\(\s*(?:https?:\/\/)?${DOMAIN_SOURCE}\s*\)`, "giu");

/** "Site officiel glutella.tn": the kind of source is kept, not its address. */
const OFFICIAL_SITE_ADDRESS = new RegExp(
  String.raw`\b(sites?\s+(?:officiels?|web|internet))\s*:?\s+(?:https?:\/\/)?${DOMAIN_SOURCE}`,
  "giu",
);

/** CeliacCare's own address and accounts may stay. */
const isOwn = (match: string) => /celiaccare/i.test(match);

/** ٠-٩ and ۰-۹ become 0-9, one character for one (positions stay the same). */
function latinDigits(text: string) {
  return text.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

/**
 * Where the contacts that can never stay are: phone numbers, e-mails, web addresses, @accounts and
 * domain names followed by a path (wa.me/216…, facebook.com/…). A bare domain name is handled apart.
 */
function contactRanges(text: string): [number, number][] {
  const latin = latinDigits(text);
  const ranges: [number, number][] = [];
  for (const pattern of [TUNISIAN_PHONE, INTERNATIONAL_PHONE, EMAIL, WEB_ADDRESS, HANDLE, DOMAIN]) {
    for (const match of latin.matchAll(pattern)) {
      // A bare domain name ("Managers.tn") is not removed: it becomes a name (domainsToNames).
      if (pattern === DOMAIN && !match[2]) continue;
      if (!isOwn(match[0])) ranges.push([match.index, match.index + match[0].length]);
    }
  }
  return ranges;
}

const hasContact = (text: string) => contactRanges(text).length > 0;

/** The text without those contacts (overlapping matches are merged). */
function removeContacts(text: string) {
  const ranges = contactRanges(text).sort((a, b) => a[0] - b[0]);
  let result = "";
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (end <= cursor) continue;
    result += text.slice(cursor, Math.max(start, cursor));
    cursor = end;
  }
  return result + text.slice(cursor);
}

/** Generic second-level names: example.com.tn is "example", not "com". */
const SECOND_LEVELS = new Set(["com", "org", "net", "gov", "edu", "co", "nat", "ens", "info", "www"]);

/** "glutella.tn" -> "glutella", "Managers.tn" -> "Managers": still a name, no longer an address. */
function domainsToNames(text: string) {
  return text.replace(DOMAIN, (match: string, host: string, path: string | undefined) => {
    if (path || isOwn(match)) return match;
    const labels = host.split(".").slice(0, -1);
    while (labels.length > 1 && SECOND_LEVELS.has(labels.at(-1)!.toLowerCase())) labels.pop();
    return labels.at(-1) ?? "";
  });
}

/** Brackets whose content gives a contact are removed entirely: "Mar – Ven (réservations au 98 254 255)". */
function removeBracketsWithContacts(text: string) {
  return text.replace(/\s*\(([^()]*)\)/g, (group: string, inside: string) => (hasContact(inside) ? "" : group));
}

/** Spaces and punctuation left behind by a removal. Spaces before « : ; ! ? » stay (French typography). */
function tidy(text: string) {
  return text
    .replace(/\(\s*\)|\[\s*\]|«\s*»/g, "")
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/[^\S\n]+([,.)\]])/g, "$1")
    .replace(/([(\[])[^\S\n]+/g, "$1")
    .replace(/([,;·|•])(?:[^\S\n]*[,;:·|•])+/g, "$1")
    .split("\n")
    .map((line) => line.replace(/^[\s,;:·|•]+|[\s,;:·|•]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** A sentence ends with . ! ? ؟ or … followed by a capital, an Arabic letter, a digit or a quote. */
const SENTENCE_BREAK = /(?<=[.!?؟…])\s+(?=[\p{Lu}\p{Lo}\p{N}«"“(])/u;

/** Parts of a short text: "Lun – Ven · 9h – 17h · Sam · 9h – 13h". */
const PART_BREAK = /(\s+[·|•;]\s+|\n)/;

/**
 * True when the text gives a contact: a phone number, an e-mail, a web address or a domain name,
 * an @account. CeliacCare's own address is allowed.
 */
export function containsContact(text: string | null | undefined): boolean {
  if (!text) return false;
  return hasContact(text) || [...text.matchAll(DOMAIN)].some((match) => !isOwn(match[0]));
}

/**
 * A long public text (description, review comment): the sentences that give a contact are left out,
 * and a bare domain name becomes a name ("Élue par Managers.tn" -> "Élue par Managers").
 * Null when nothing is left.
 */
export function publicText(text: string | null): string | null {
  if (!text || !containsContact(text)) return text;
  const lines = removeBracketsWithContacts(text)
    .split("\n")
    .map((line) =>
      line
        .split(SENTENCE_BREAK)
        .filter((sentence) => !hasContact(sentence))
        .join(" "),
    );
  return tidy(domainsToNames(lines.join("\n"))) || null;
}

/**
 * A short public text (opening hours, address, cuisine, a reviewer's name): the parts ("·", "|", ";")
 * that give a contact are left out, any other contact is removed where it is. Null when nothing is left.
 */
export function publicLabel(text: string | null): string | null {
  if (!text || !containsContact(text)) return text;
  const kept = removeBracketsWithContacts(text)
    .split(PART_BREAK)
    .filter((part, index, parts) =>
      // A separator (odd index) goes away with the part that follows it.
      index % 2 === 1 ? !hasContact(parts[index + 1] ?? "") : !hasContact(part),
    )
    .join("");
  return tidy(domainsToNames(removeContacts(kept))) || null;
}

/**
 * The verification source of a sheet: its provenance stays ("Site officiel", "Guide de l'ATMC 2023",
 * "La Presse, 23/05/2026"), but not the address that leads to the business or to another shop:
 * - "prix relevés sur tunisiebio.tn et glutenfree.tn" / "sur Glovo" -> "prix relevés en ligne";
 * - "Site officiel de l'ATMC (atmc.tn)" -> "Site officiel de l'ATMC";
 * - "Site officiel glutella.tn" -> "Site officiel"; "Managers.tn" (a newspaper) -> "Managers".
 */
export function publicSource(text: string): string {
  const cleaned = text
    .replace(ON_OTHER_SHOPS, "en ligne")
    .replace(DOMAIN_IN_BRACKETS, "")
    .replace(OFFICIAL_SITE_ADDRESS, "$1");
  return publicLabel(cleaned) ?? "";
}
