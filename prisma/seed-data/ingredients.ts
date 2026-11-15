/**
 * Ingredients (demo data), used by products and restaurant dishes.
 * - `slug` is the unique key (products and dishes refer to ingredients by slug).
 * - `isAllergen: true` for the major allergens shown on product sheets
 *   (milk, eggs, nuts, sesame, peanuts, fish, soy...). Gluten itself is not listed:
 *   nothing sold on CeliacCare should contain it.
 * - Oats are flagged as an allergen even when certified gluten-free: food labels still
 *   highlight them, and some coeliac people do not tolerate them.
 */

export type SeedIngredient = {
  slug: string;
  name: string;
  nameAr: string;
  isAllergen: boolean;
};

export const INGREDIENTS: SeedIngredient[] = [
  // --- Gluten-free cereals, flours and starches -----------------------------
  { slug: "riz", name: "Riz", nameAr: "أرز", isAllergen: false },
  { slug: "farine-de-riz", name: "Farine de riz", nameAr: "دقيق الأرز", isAllergen: false },
  { slug: "mais", name: "Maïs", nameAr: "ذرة", isAllergen: false },
  { slug: "sorgho", name: "Sorgho", nameAr: "درع", isAllergen: false },
  { slug: "pois-chiches", name: "Pois chiches", nameAr: "حمص", isAllergen: false },
  { slug: "sarrasin", name: "Sarrasin", nameAr: "حنطة سوداء", isAllergen: false },
  { slug: "quinoa", name: "Quinoa", nameAr: "كينوا", isAllergen: false },
  { slug: "fecule-de-pomme-de-terre", name: "Fécule de pomme de terre", nameAr: "نشا البطاطا", isAllergen: false },
  { slug: "pomme-de-terre", name: "Pomme de terre", nameAr: "بطاطا", isAllergen: false },
  { slug: "psyllium", name: "Psyllium", nameAr: "قشور السيليوم", isAllergen: false },
  { slug: "levure", name: "Levure boulangère", nameAr: "خميرة الخبز", isAllergen: false },
  { slug: "avoine-sans-gluten", name: "Avoine certifiée sans gluten", nameAr: "شوفان معتمد خالٍ من الغلوتين", isAllergen: true },

  // --- Fruits, vegetables and herbs -----------------------------------------
  { slug: "dattes", name: "Dattes", nameAr: "تمر", isAllergen: false },
  { slug: "tomate", name: "Tomate", nameAr: "طماطم", isAllergen: false },
  { slug: "piment", name: "Piment", nameAr: "فلفل", isAllergen: false },
  { slug: "ail", name: "Ail", nameAr: "ثوم", isAllergen: false },
  { slug: "citron", name: "Citron", nameAr: "ليمون", isAllergen: false },
  { slug: "menthe", name: "Menthe", nameAr: "نعناع", isAllergen: false },
  { slug: "corete", name: "Corète (mloukhia)", nameAr: "ملوخية", isAllergen: false },

  // --- Spices, sweeteners, oils ----------------------------------------------
  { slug: "carvi", name: "Carvi", nameAr: "كروية", isAllergen: false },
  { slug: "coriandre", name: "Coriandre", nameAr: "كسبر", isAllergen: false },
  { slug: "cumin", name: "Cumin", nameAr: "كمون", isAllergen: false },
  { slug: "anis-vert", name: "Anis vert", nameAr: "يانسون", isAllergen: false },
  { slug: "fenugrec", name: "Fenugrec", nameAr: "حلبة", isAllergen: false },
  { slug: "sel", name: "Sel", nameAr: "ملح", isAllergen: false },
  { slug: "sucre", name: "Sucre", nameAr: "سكر", isAllergen: false },
  { slug: "miel", name: "Miel", nameAr: "عسل", isAllergen: false },
  { slug: "huile-d-olive", name: "Huile d'olive", nameAr: "زيت الزيتون", isAllergen: false },
  { slug: "eau-de-fleur-d-oranger", name: "Eau de fleur d'oranger", nameAr: "ماء الزهر", isAllergen: false },
  { slug: "cacao", name: "Cacao", nameAr: "كاكاو", isAllergen: false },
  { slug: "graines-de-lin", name: "Graines de lin", nameAr: "بذور الكتان", isAllergen: false },
  { slug: "pignons-de-pin", name: "Pignons de pin", nameAr: "صنوبر", isAllergen: false },

  // --- Meat -------------------------------------------------------------------
  { slug: "agneau", name: "Agneau", nameAr: "لحم الخروف", isAllergen: false },
  { slug: "boeuf", name: "Bœuf", nameAr: "لحم البقر", isAllergen: false },
  { slug: "poulet", name: "Poulet", nameAr: "دجاج", isAllergen: false },

  // --- Allergens ----------------------------------------------------------------
  { slug: "lait", name: "Lait", nameAr: "حليب", isAllergen: true },
  { slug: "beurre", name: "Beurre", nameAr: "زبدة", isAllergen: true },
  { slug: "fromage", name: "Fromage", nameAr: "جبن", isAllergen: true },
  { slug: "oeufs", name: "Œufs", nameAr: "بيض", isAllergen: true },
  { slug: "amandes", name: "Amandes", nameAr: "لوز", isAllergen: true },
  { slug: "noisettes", name: "Noisettes", nameAr: "بندق", isAllergen: true },
  { slug: "pistaches", name: "Pistaches", nameAr: "فستق", isAllergen: true },
  { slug: "sesame", name: "Sésame", nameAr: "سمسم", isAllergen: true },
  { slug: "arachides", name: "Arachides", nameAr: "فول سوداني", isAllergen: true },
  { slug: "poisson", name: "Poisson", nameAr: "سمك", isAllergen: true },
  { slug: "thon", name: "Thon", nameAr: "تن", isAllergen: true },
  { slug: "soja", name: "Soja", nameAr: "صويا", isAllergen: true },
];
