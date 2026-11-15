/**
 * Keys of the category icons (stored in Category.icon). React-free on purpose:
 * server code (models, Server Actions) can import it to validate an icon key.
 * The matching icon components are in lib/icons.ts.
 */
export const CATEGORY_ICON_KEYS = [
  "bread", "pastry", "biscuits", "couscous", "soup", "flour", "pantry", "nuts", "dates", "sweets", "breakfast",
  "snacks", "drinks", "dairy", "meals", "salad", "pizza", "sandwich", "icecream", "chef", "leaf", "package",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

export function isCategoryIconKey(value: string): value is CategoryIconKey {
  return (CATEGORY_ICON_KEYS as readonly string[]).includes(value);
}
