/**
 * Product categories (demo data).
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
    slug: "pains-viennoiseries",
    name: "Pains & viennoiseries",
    nameAr: "الخبز والمخبوزات",
    description:
      "Pain de mie, baguettes, pains ronds au sorgho et croissants, pétris sans blé par des boulangers artisans.",
    descriptionAr: "خبز التوست والباقات والخبز المستدير بالدرع والكرواسون، تُعجن دون قمح لدى خبّازين حرفيين.",
    icon: "bread",
    sortOrder: 1,
  },
  {
    slug: "patisserie-tunisienne",
    name: "Pâtisserie tunisienne",
    nameAr: "الحلويات التونسية",
    description:
      "Makroudh, kaak warka, ghraiba et baklawa : les douceurs des fêtes, revisitées sans gluten par des pâtissières de chez nous.",
    descriptionAr: "مقروض وكعك ورقة وغريبة وبقلاوة: حلويات المناسبات في نسخة خالية من الغلوتين بأيادٍ تونسية.",
    icon: "pastry",
    sortOrder: 2,
  },
  {
    slug: "biscuits-gateaux",
    name: "Biscuits & gâteaux",
    nameAr: "البسكويت والمرطبات",
    description:
      "Sablés, financiers, brownies et biscuits à l'anis pour le goûter, à base de farines de riz, de sarrasin ou d'amande.",
    descriptionAr: "بسكويت وفينانسيي وبراوني وكعك باليانسون للّمجة، بدقيق الأرز أو الحنطة السوداء أو اللوز.",
    icon: "biscuits",
    sortOrder: 3,
  },
  {
    slug: "couscous-pates",
    name: "Couscous & pâtes",
    nameAr: "الكسكسي والعجين",
    description:
      "Couscous de maïs ou de sorgho roulé à la main, mhamsa, pâtes de riz et feuilles de brik sans gluten pour cuisiner comme d'habitude.",
    descriptionAr: "كسكسي بالذرة أو بالدرع مفتول باليد، محمّصة، معكرونة الأرز وورقة ملسوقة خالية من الغلوتين للطبخ كالعادة.",
    icon: "couscous",
    sortOrder: 4,
  },
  {
    slug: "farines-cereales",
    name: "Farines & céréales",
    nameAr: "الدقيق والحبوب",
    description:
      "Farines de riz et de pois chiches, mélanges prêts à l'emploi pour réussir pains, crêpes et gâteaux à la maison.",
    descriptionAr: "دقيق الأرز والحمص وخلطات جاهزة لتحضير الخبز والكريب والمرطبات في المنزل.",
    icon: "flour",
    sortOrder: 5,
  },
  {
    slug: "petit-dejeuner",
    name: "Petit-déjeuner & bsissa",
    nameAr: "فطور الصباح والبسيسة",
    description: "Bsissa sans blé, droô de sorgho, granola et halwa chamia : de quoi bien commencer la journée.",
    descriptionAr: "بسيسة دون قمح، درع، غرانولا وحلوى شامية لبداية يوم موفّقة.",
    icon: "breakfast",
    sortOrder: 6,
  },
  {
    slug: "epicerie-condiments",
    name: "Épicerie & condiments",
    nameAr: "البقالة والتوابل",
    description:
      "Harissa du Cap Bon, huile d'olive de Sfax, épices de Djerba et mloukhia : les bases de la cuisine tunisienne, sans farine cachée.",
    descriptionAr: "هريسة الوطن القبلي وزيت زيتون صفاقس وتوابل جربة والملوخية: أساسيات المطبخ التونسي دون دقيق مخفي.",
    icon: "pantry",
    sortOrder: 7,
  },
  {
    slug: "dattes",
    name: "Dattes",
    nameAr: "التمور",
    description: "Deglet Nour des oasis de Tozeur, pâte de dattes et dattes fourrées, naturellement sans gluten.",
    descriptionAr: "دقلة النور من واحات توزر، عجينة التمر والتمر المحشي، خالية من الغلوتين بطبيعتها.",
    icon: "dates",
    sortOrder: 8,
  },
  {
    slug: "snacks-aperitifs",
    name: "Snacks & apéritifs",
    nameAr: "المقرمشات والمقبلات",
    description: "Pois chiches grillés, chips de pois chiches et crackers aux graines de lin pour grignoter sans souci.",
    descriptionAr: "حمص محمّص ورقائق الحمص وبسكويت مالح ببذور الكتان للتسلية دون قلق.",
    icon: "snacks",
    sortOrder: 9,
  },
  {
    slug: "plats-prepares",
    name: "Plats préparés & surgelés",
    nameAr: "الأطباق الجاهزة والمجمّدة",
    description: "Pizzas et briks surgelées sans gluten, prêtes à cuire pour les soirs pressés.",
    descriptionAr: "بيتزا وبريك مجمّدة خالية من الغلوتين، جاهزة للطهي في الأمسيات المستعجلة.",
    icon: "meals",
    sortOrder: 10,
  },
];
