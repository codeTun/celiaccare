/**
 * Product categories (only the ones that have real products).
 * - `slug` is the unique key: the seed finds an existing category by its slug.
 * - `icon` must be one of the keys of CATEGORY_ICONS in lib/icons.ts.
 * - `sortOrder` decides the order of the categories on the website (1 = first).
 */

/** Keys of CATEGORY_ICONS (lib/icons.ts) used below. */
export type CategoryIconKey =
  | "bread"
  | "pastry"
  | "biscuits"
  | "couscous"
  | "soup"
  | "flour"
  | "pantry"
  | "nuts"
  | "dates"
  | "sweets"
  | "breakfast"
  | "snacks"
  | "drinks"
  | "dairy"
  | "meals"
  | "salad"
  | "pizza"
  | "sandwich"
  | "icecream"
  | "chef"
  | "leaf"
  | "package";

export type SeedCategory = {
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: CategoryIconKey;
  sortOrder: number;
};

export const CATEGORIES: SeedCategory[] = [
  {
    slug: "patisserie-tunisienne",
    name: "Pâtisserie tunisienne",
    nameAr: "الحلويات التونسية",
    description:
      "Makroudh, ghrayba, bachkoutou et biscuits traditionnels : les douceurs tunisiennes, en version sans gluten.",
    descriptionAr: "مقروض وغريبة وبشكوتو وبسكويت تقليدي: الحلويات التونسية في نسخة خالية من الغلوتين.",
    icon: "pastry",
    sortOrder: 2,
  },
  {
    slug: "biscuits-gateaux",
    name: "Biscuits & gâteaux",
    nameAr: "البسكويت والمرطبات",
    description:
      "Sablés, cookies, financiers, madeleines et desserts pour le goûter, sans gluten.",
    descriptionAr: "صابلي وكوكيز وفينونسيي ومادلين وتحليات للّمجة، خالية من الغلوتين.",
    icon: "biscuits",
    sortOrder: 3,
  },
  {
    slug: "couscous-pates",
    name: "Couscous & pâtes",
    nameAr: "الكسكسي والعجين",
    description:
      "Couscous de maïs, de riz ou de sarrasin, mhamsa, nouasser, fell et pâtes sans gluten de fabricants tunisiens, pour cuisiner comme d'habitude.",
    descriptionAr: "كسكسي بالذرة أو الأرز أو الحنطة السوداء، محمّص، نواصر، فِل وعجين خالٍ من الغلوتين من مصنّعين تونسيين، للطبخ كالعادة.",
    icon: "couscous",
    sortOrder: 4,
  },
  {
    slug: "farines-cereales",
    name: "Farines & céréales",
    nameAr: "الدقيق والحبوب",
    description:
      "Farines de riz, de sorgho et de pois chiche, mix pain, pizza et pâtisserie pour cuisiner sans gluten à la maison.",
    descriptionAr: "دقيق الأرز والدرع والحمّص، وخلطات الخبز والبيتزا والحلويات للطبخ دون غلوتين في المنزل.",
    icon: "flour",
    sortOrder: 5,
  },
  {
    slug: "petit-dejeuner",
    name: "Petit-déjeuner & bsissa",
    nameAr: "فطور الصباح والبسيسة",
    description: "La bsissa sans gluten du petit-déjeuner tunisien, pour bien commencer la journée.",
    descriptionAr: "بسيسة خالية من الغلوتين لفطور الصباح التونسي، لبداية يوم موفّقة.",
    icon: "breakfast",
    sortOrder: 6,
  },
  {
    slug: "plats-prepares",
    name: "Sandwichs & plats préparés",
    nameAr: "السندويتشات والأطباق الجاهزة",
    description: "Sandwichs et plats prêts à manger sur pain sans gluten, pour le déjeuner.",
    descriptionAr: "سندويتشات وأطباق جاهزة بخبز خالٍ من الغلوتين، للغداء.",
    icon: "meals",
    sortOrder: 10,
  },
  {
    slug: "epicerie-condiments",
    name: "Épicerie & condiments",
    nameAr: "البقالة والتوابل",
    description:
      "Miel brut de Sejnan et du Cap Bon, vinaigre de dattes artisanal : des produits d'épicerie de petits producteurs tunisiens.",
    descriptionAr: "عسل خام من سجنان والوطن القبلي وخلّ تمر تقليدي: مواد بقالة من منتجين تونسيين صغار.",
    icon: "pantry",
    sortOrder: 7,
  },
  {
    slug: "dattes",
    name: "Dattes",
    nameAr: "التمور",
    description: "Pâtes à tartiner, confiture et jus à base de dattes Deglet Nour du sud tunisien.",
    descriptionAr: "كريمات للدهن ومعجون وعصير أساسها تمر دقلة النور من الجنوب التونسي.",
    icon: "dates",
    sortOrder: 8,
  },
];
