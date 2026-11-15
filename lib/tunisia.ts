/**
 * Tunisia-specific helpers: governorates, phone numbers and the
 * "order day" used by the 3-orders-per-day rule (spec EF-35/EF-36).
 */

export const GOVERNORATES = [
  { value: "Tunis", ar: "تونس" },
  { value: "Ariana", ar: "أريانة" },
  { value: "Ben Arous", ar: "بن عروس" },
  { value: "Manouba", ar: "منوبة" },
  { value: "Nabeul", ar: "نابل" },
  { value: "Zaghouan", ar: "زغوان" },
  { value: "Bizerte", ar: "بنزرت" },
  { value: "Béja", ar: "باجة" },
  { value: "Jendouba", ar: "جندوبة" },
  { value: "Le Kef", ar: "الكاف" },
  { value: "Siliana", ar: "سليانة" },
  { value: "Sousse", ar: "سوسة" },
  { value: "Monastir", ar: "المنستير" },
  { value: "Mahdia", ar: "المهدية" },
  { value: "Sfax", ar: "صفاقس" },
  { value: "Kairouan", ar: "القيروان" },
  { value: "Kasserine", ar: "القصرين" },
  { value: "Sidi Bouzid", ar: "سيدي بوزيد" },
  { value: "Gabès", ar: "قابس" },
  { value: "Médenine", ar: "مدنين" },
  { value: "Tataouine", ar: "تطاوين" },
  { value: "Gafsa", ar: "قفصة" },
  { value: "Tozeur", ar: "توزر" },
  { value: "Kébili", ar: "قبلي" },
] as const;

export type Governorate = (typeof GOVERNORATES)[number]["value"];

export const GOVERNORATE_VALUES = GOVERNORATES.map((g) => g.value) as unknown as readonly [
  Governorate,
  ...Governorate[],
];

export function isGovernorate(value: string): value is Governorate {
  return GOVERNORATES.some((g) => g.value === value);
}

/** Display name of a governorate in the page language. */
export function governorateLabel(value: string, locale: "fr" | "ar") {
  if (locale === "fr") return value;
  return GOVERNORATES.find((g) => g.value === value)?.ar ?? value;
}

/**
 * Normalise a Tunisian phone number to its 8 digits.
 * Accepts "+216 20 123 456", "0021620123456", "20-123-456"...
 * Returns null when it is not a valid Tunisian number (EF-31).
 */
export function normalizeTunisianPhone(input: string): string | null {
  let digits = input.replace(/[\s.\-()/]/g, "");
  if (digits.startsWith("+216")) digits = digits.slice(4);
  else if (digits.startsWith("00216")) digits = digits.slice(5);
  else if (digits.length === 11 && digits.startsWith("216")) digits = digits.slice(3);
  return /^[2-9]\d{7}$/.test(digits) ? digits : null;
}

/** The current day in Tunis as "YYYY-MM-DD" — the counter resets at midnight Tunis time (EF-36). */
export function tunisDayKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Maximum number of orders per phone number per day (EF-35). */
export const MAX_ORDERS_PER_DAY = 3;
