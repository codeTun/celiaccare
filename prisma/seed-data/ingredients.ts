/**
 * Ingredients, used by products and restaurant dishes (lists only what sources publish).
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
  { slug: "noix-de-cajou", name: "Noix de cajou", nameAr: "كاجو", isAllergen: true },
  { slug: "noix", name: "Noix", nameAr: "جوز", isAllergen: true },

  // --- Found in the published compositions of real products and menus ----------
  { slug: "legumineuses", name: "Légumineuses", nameAr: "بقوليات", isAllergen: false },
  { slug: "fibres-vegetales", name: "Fibres végétales", nameAr: "ألياف نباتية", isAllergen: false },
  { slug: "curcuma", name: "Curcuma", nameAr: "كركم", isAllergen: false },
  { slug: "poivron", name: "Poivron", nameAr: "فلفل حلو", isAllergen: false },
  { slug: "graines-de-tournesol", name: "Graines de tournesol", nameAr: "بذور عبّاد الشمس", isAllergen: false },
  { slug: "graines-de-courge", name: "Graines de courge", nameAr: "بذور القرع", isAllergen: false },
  { slug: "millet", name: "Millet", nameAr: "دخن", isAllergen: false },
  { slug: "riz-complet", name: "Riz complet", nameAr: "أرز كامل", isAllergen: false },
  { slug: "noix-de-coco", name: "Noix de coco", nameAr: "جوز الهند", isAllergen: false },
  { slug: "avocat", name: "Avocat", nameAr: "أفوكادو", isAllergen: false },
  { slug: "epinards", name: "Épinards", nameAr: "سبانخ", isAllergen: false },
  { slug: "chou", name: "Chou", nameAr: "كرنب", isAllergen: false },
  { slug: "the", name: "Thé", nameAr: "شاي", isAllergen: false },
  { slug: "matcha", name: "Matcha", nameAr: "ماتشا", isAllergen: false },
  { slug: "fruits", name: "Fruits frais", nameAr: "فواكه طازجة", isAllergen: false },
  { slug: "raisins-secs", name: "Raisins secs", nameAr: "زبيب", isAllergen: false },

  // --- Generic terms of published compositions (the maker does not detail them: Glucélia mixes) ---
  { slug: "farines-sans-gluten", name: "Farines sans gluten", nameAr: "دقيق خالٍ من الغلوتين", isAllergen: false },
  { slug: "amidon-sans-gluten", name: "Amidon sans gluten", nameAr: "نشا خالٍ من الغلوتين", isAllergen: false },
  { slug: "semoule-sans-gluten", name: "Semoule sans gluten", nameAr: "سميد خالٍ من الغلوتين", isAllergen: false },
  { slug: "levure-sans-gluten", name: "Levure sans gluten", nameAr: "خميرة خالية من الغلوتين", isAllergen: false },
  { slug: "emulsifiant", name: "Émulsifiant", nameAr: "مستحلب", isAllergen: false },
];
