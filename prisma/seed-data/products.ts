/**
 * Products of the businesses of producers.ts: REAL products, researched on public sources on
 * 2026-11-21 (official websites, the businesses' Glovo page, Tunisian online shops).
 *
 * - `slug` is the unique key: the seed finds an existing product by its slug.
 * - `price` is in MILLIMES (1 DT = 1000 millimes): the public price seen on the source given in
 *   the producer's `verificationSource` (for brands: the shop price at a Tunisian retailer).
 * - `ingredients`: ONLY the composition published by the maker, as ingredient slugs. When the
 *   full composition is not published, the list stays EMPTY and the product sheet says so
 *   (people with allergies rely on these lists: never guess or pad them).
 * - No product is CERTIFIED: none of these businesses shows an official certificate. They are
 *   100 % gluten-free businesses or units (guarantee level DEDICATED).
 * - `unit`: as published; "Sachet" / "Pièce" when the weight is not published.
 * - Photos are not seeded (the photos of real businesses belong to them): the site shows a
 *   branded placeholder until the admin uploads a photo the business agreed to share.
 * - `addedDaysAgo` marks a recent product (shown first in "Nouveautés").
 */
import type { GuaranteeLevel } from "../../types/enums";

export type SeedProduct = {
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  /** Price in millimes (9800 = 9,800 DT). */
  price: number;
  unit: string;
  /** Category slug (categories.ts). */
  category: string;
  /** Producer slug (producers.ts). */
  producer: string;
  guaranteeLevel: GuaranteeLevel;
  certification?: string;
  mayContain?: string;
  /** Ingredient slugs (ingredients.ts), main ingredient first. Empty = composition not published. */
  ingredients: string[];
  isFeatured?: boolean;
  /** false = temporarily out of stock (default: true). */
  isAvailable?: boolean;
  /** false = hidden from the public site (default: true). */
  isActive?: boolean;
  addedDaysAgo?: number;
};

const GF = "DEDICATED" as const;

export const PRODUCTS: SeedProduct[] = [
  // ---------------------------------------------------------------------------
  // Glutella — gluten-free maker, Mohamedia (Ben Arous). Prices: tunisiebio.tn
  // ---------------------------------------------------------------------------
  {
    slug: "glutella-couscous-sans-gluten",
    name: "Couscous sans gluten",
    nameAr: "كسكسي خالٍ من الغلوتين",
    description:
      "Le couscous sans gluten de Glutella, pour le couscous du vendredi en famille. Composition publiée : amidon de maïs, riz, légumineuses, fibres, sel, curcuma, poivron.",
    descriptionAr:
      "كسكسي Glutella الخالي من الغلوتين، لكسكسي الجمعة مع العائلة. المكوّنات المنشورة: نشا الذرة، أرز، بقوليات، ألياف، ملح، كركم، فلفل حلو.",
    price: 5500,
    unit: "200 g",
    category: "couscous-pates",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: ["mais", "riz", "legumineuses", "fibres-vegetales", "sel", "curcuma", "poivron"],
    isFeatured: true,
  },
  {
    slug: "glutella-couscous-sarrasin",
    name: "Couscous au sarrasin sans gluten",
    nameAr: "كسكسي بالحنطة السوداء خالٍ من الغلوتين",
    description: "Un couscous au sarrasin, au goût plus rustique, fabriqué par Glutella.",
    descriptionAr: "كسكسي بالحنطة السوداء بنكهة ريفية، من صنع Glutella.",
    price: 8500,
    unit: "200 g",
    category: "couscous-pates",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "glutella-nouasser",
    name: "Nouasser sans gluten",
    nameAr: "نواصر خالية من الغلوتين",
    description: "Les petits carrés de pâte de la cuisine tunisienne, en version sans gluten, pour les plats en sauce.",
    descriptionAr: "مربعات العجين الصغيرة في المطبخ التونسي، في نسخة خالية من الغلوتين، للأطباق بالمرق.",
    price: 5000,
    unit: "Sachet",
    category: "couscous-pates",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "glutella-farine-pois-chiche",
    name: "Farine de pois chiche",
    nameAr: "دقيق الحمّص",
    description: "Farine de pois chiche pour les galettes, les beignets et la pâtisserie salée.",
    descriptionAr: "دقيق الحمّص للفطائر والخفاف والمعجنات المالحة.",
    price: 11800,
    unit: "500 g",
    category: "farines-cereales",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: ["pois-chiches"],
  },
  {
    slug: "glutella-farine-sorgho",
    name: "Farine de sorgho",
    nameAr: "دقيق الدرع",
    description: "Farine 100 % sorgho, la céréale sans gluten traditionnelle du Maghreb.",
    descriptionAr: "دقيق درع بنسبة 100٪، الحبوب التقليدية الخالية من الغلوتين في المغرب العربي.",
    price: 11500,
    unit: "Sachet",
    category: "farines-cereales",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: ["sorgho"],
  },
  {
    slug: "glutella-mix-sarrasin",
    name: "Mix de farine de sarrasin",
    nameAr: "خليط دقيق الحنطة السوداء",
    description: "Un mélange de farines à base de sarrasin, pour le pain et les gâteaux maison.",
    descriptionAr: "خليط دقيق أساسه الحنطة السوداء، للخبز والكعك في البيت.",
    price: 16800,
    unit: "1 kg",
    category: "farines-cereales",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "glutella-farine-mix-patisserie",
    name: "Farine mix pâtisserie",
    nameAr: "خليط دقيق للحلويات",
    description:
      "Un mélange prêt à l'emploi pour remplacer la farine dans les gâteaux. Composition publiée : farine de riz, fécule de pomme de terre, amidon de maïs.",
    descriptionAr:
      "خليط جاهز يعوّض الدقيق في الكعك. المكوّنات المنشورة: دقيق الأرز، نشا البطاطا، نشا الذرة.",
    price: 13800,
    unit: "800 g",
    category: "farines-cereales",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: ["farine-de-riz", "fecule-de-pomme-de-terre", "mais"],
    isFeatured: true,
  },
  {
    slug: "glutella-bachkoutou-sarrasin",
    name: "Bachkoutou au sarrasin, sans sucre",
    nameAr: "بشكوتو بالحنطة السوداء دون سكر",
    description: "Le biscuit long tunisien (bachkoutou tounsi), au sarrasin et sans sucre ajouté, pour le café.",
    descriptionAr: "البشكوتو التونسي الطويل، بالحنطة السوداء ودون سكر مضاف، مع القهوة.",
    price: 21000,
    unit: "Sachet",
    category: "patisserie-tunisienne",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: [],
    addedDaysAgo: 12,
  },
  {
    slug: "glutella-sables-fraise",
    name: "Sablés au sarrasin à la confiture de fraise",
    nameAr: "صابلي بالحنطة السوداء ومربى الفراولة",
    description: "Des sablés au sarrasin fourrés à la confiture de fraise, sans sucre ajouté.",
    descriptionAr: "صابلي بالحنطة السوداء محشو بمربى الفراولة، دون سكر مضاف.",
    price: 18500,
    unit: "Sachet",
    category: "biscuits-gateaux",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "glutella-cookies-sarrasin",
    name: "Cookies au sarrasin, sans sucre",
    nameAr: "كوكيز بالحنطة السوداء دون سكر",
    description: "Des cookies au sarrasin sans gluten et sans sucre ajouté, pour le goûter.",
    descriptionAr: "كوكيز بالحنطة السوداء خالية من الغلوتين ودون سكر مضاف، للّمجة.",
    price: 20000,
    unit: "Sachet",
    category: "biscuits-gateaux",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "glutella-bsissa",
    name: "Bsissa sans gluten",
    nameAr: "بسيسة خالية من الغلوتين",
    description: "La bsissa du petit-déjeuner tunisien, en version sans gluten, à délayer avec de l'huile d'olive ou du lait.",
    descriptionAr: "بسيسة فطور الصباح التونسي في نسخة خالية من الغلوتين، تُخلط بزيت الزيتون أو الحليب.",
    price: 11000,
    unit: "500 g",
    category: "petit-dejeuner",
    producer: "glutella",
    guaranteeLevel: GF,
    ingredients: [],
    isFeatured: true,
  },

  // ---------------------------------------------------------------------------
  // Ibn Hayyan — gluten-free maker, Msaken (Sousse). Prices: ibnhayyan.tn, tunisiebio.tn
  // ---------------------------------------------------------------------------
  {
    slug: "ibn-hayyan-couscous-traditionnel",
    name: "Couscous traditionnel sans gluten",
    nameAr: "كسكسي تقليدي خالٍ من الغلوتين",
    description: "Le couscous traditionnel d'Ibn Hayyan. Composition publiée : riz, légumineuses, sel. Existe aussi en 2 kg.",
    descriptionAr: "الكسكسي التقليدي من ابن حيّان. المكوّنات المنشورة: أرز، بقوليات، ملح. متوفّر أيضًا في كيس 2 كغ.",
    price: 7400,
    unit: "360 g",
    category: "couscous-pates",
    producer: "ibn-hayyan",
    guaranteeLevel: GF,
    ingredients: ["riz", "legumineuses", "sel"],
    isFeatured: true,
  },
  {
    slug: "ibn-hayyan-mhamsa",
    name: "Mhamsa traditionnelle sans gluten",
    nameAr: "محمّص تقليدي خالٍ من الغلوتين",
    description: "Les grosses perles de pâte de la cuisine tunisienne, pour les soupes et les plats en sauce.",
    descriptionAr: "حبّات العجين الكبيرة في المطبخ التونسي، للشربة والأطباق بالمرق.",
    price: 7600,
    unit: "360 g",
    category: "couscous-pates",
    producer: "ibn-hayyan",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "ibn-hayyan-langue-oiseau",
    name: "Pâtes langue d'oiseau sans gluten",
    nameAr: "عجين لسان العصفور خالٍ من الغلوتين",
    description: "Les petites pâtes en forme de grain de riz, pour la chorba et les plats au four.",
    descriptionAr: "عجين صغير على شكل حبّة الأرز، للشربة والأطباق في الفرن.",
    price: 9000,
    unit: "500 g",
    category: "couscous-pates",
    producer: "ibn-hayyan",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "ibn-hayyan-baboucha",
    name: "Pâte baboucha sans gluten",
    nameAr: "عجين البابوشة خالٍ من الغلوتين",
    description: "Les petites pâtes en coquille de la cuisine tunisienne, en version sans gluten.",
    descriptionAr: "عجين البابوشة الصغير في المطبخ التونسي، في نسخة خالية من الغلوتين.",
    price: 7000,
    unit: "360 g",
    category: "couscous-pates",
    producer: "ibn-hayyan",
    guaranteeLevel: GF,
    ingredients: [],
    addedDaysAgo: 20,
  },
  {
    slug: "ibn-hayyan-mix-pain",
    name: "Mix pain sans gluten",
    nameAr: "خليط الخبز خالٍ من الغلوتين",
    description: "Une préparation pour faire son pain sans gluten à la maison. Existe aussi en 2,5 kg.",
    descriptionAr: "خليط لتحضير الخبز الخالي من الغلوتين في البيت. متوفّر أيضًا في كيس 2,5 كغ.",
    price: 12200,
    unit: "750 g",
    category: "farines-cereales",
    producer: "ibn-hayyan",
    guaranteeLevel: GF,
    ingredients: [],
    isFeatured: true,
  },
  {
    slug: "ibn-hayyan-mix-pizza",
    name: "Mix pizza sans gluten",
    nameAr: "خليط البيتزا خالٍ من الغلوتين",
    description: "Une préparation pour pâte à pizza sans gluten, pour la pizza du week-end en famille.",
    descriptionAr: "خليط لعجين البيتزا الخالي من الغلوتين، لبيتزا نهاية الأسبوع مع العائلة.",
    price: 8000,
    unit: "500 g",
    category: "farines-cereales",
    producer: "ibn-hayyan",
    guaranteeLevel: GF,
    ingredients: [],
  },

  // ---------------------------------------------------------------------------
  // Lorizo — gluten-free maker, Sfax. Prices: tunisiebio.tn, glutenfree.tn, elixirbio.store
  // ---------------------------------------------------------------------------
  {
    slug: "lorizo-farine-riz-amelioree",
    name: "Farine de riz améliorée",
    nameAr: "دقيق أرز محسّن",
    description: "Une farine de riz préparée pour la pâtisserie et le pain, en grand format familial.",
    descriptionAr: "دقيق أرز محضّر للحلويات والخبز، في حجم عائلي كبير.",
    price: 27000,
    unit: "2,5 kg",
    category: "farines-cereales",
    producer: "lorizo",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "lorizo-couscous-fin",
    name: "Couscous fin sans gluten",
    nameAr: "كسكسي رقيق خالٍ من الغلوتين",
    description: "Un couscous à grain fin, pour le couscous au poisson ou le masfouf.",
    descriptionAr: "كسكسي بحبّة رقيقة، لكسكسي الحوت أو المسفوف.",
    price: 8500,
    unit: "400 g",
    category: "couscous-pates",
    producer: "lorizo",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "lorizo-couscous-moyen",
    name: "Couscous moyen sans gluten",
    nameAr: "كسكسي متوسط خالٍ من الغلوتين",
    description: "Un couscous à grain moyen, au maïs et au riz.",
    descriptionAr: "كسكسي بحبّة متوسطة، بالذرة والأرز.",
    price: 7900,
    unit: "400 g",
    category: "couscous-pates",
    producer: "lorizo",
    guaranteeLevel: GF,
    ingredients: ["mais", "riz"],
  },
  {
    slug: "lorizo-masfouf",
    name: "Masfouf sans gluten",
    nameAr: "مسفوف خالٍ من الغلوتين",
    description: "Le couscous fin du masfouf sucré, à servir avec des dattes, des raisins secs et des fruits secs.",
    descriptionAr: "كسكسي المسفوف الحلو الرقيق، يُقدَّم مع التمر والزبيب والفواكه الجافة.",
    price: 8700,
    unit: "400 g",
    category: "couscous-pates",
    producer: "lorizo",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "lorizo-biscuit-long-amandes",
    name: "Biscuit long aux amandes, sans sucre",
    nameAr: "بشكوتو باللوز دون سكر",
    description: "Un biscuit long aux amandes, sans gluten et sans sucre ajouté. Contient des amandes.",
    descriptionAr: "بشكوتو طويل باللوز، خالٍ من الغلوتين ودون سكر مضاف. يحتوي على اللوز.",
    price: 7800,
    unit: "Sachet",
    category: "biscuits-gateaux",
    producer: "lorizo",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "lorizo-biscuit-long-vanille",
    name: "Biscuit long à la vanille",
    nameAr: "بشكوتو بالفانيليا",
    description: "Un biscuit long à la vanille, sans gluten, pour le café ou le goûter.",
    descriptionAr: "بشكوتو طويل بالفانيليا، خالٍ من الغلوتين، مع القهوة أو في اللمجة.",
    price: 5800,
    unit: "Sachet",
    category: "biscuits-gateaux",
    producer: "lorizo",
    guaranteeLevel: GF,
    ingredients: [],
  },

  // ---------------------------------------------------------------------------
  // Ecopasta — gluten-free maker, El Manar 2 (Tunis). 100 % maize and rice. Prices: tyfano.tn
  // ---------------------------------------------------------------------------
  {
    slug: "ecopasta-couscous-mais",
    name: "Couscous de maïs sans gluten",
    nameAr: "كسكسي الذرة خالٍ من الغلوتين",
    description: "Un couscous 100 % maïs en format familial, le moins cher au kilo du catalogue.",
    descriptionAr: "كسكسي من الذرة بنسبة 100٪ في حجم عائلي، الأرخص للكيلو في الكتالوج.",
    price: 9500,
    unit: "1 kg",
    category: "couscous-pates",
    producer: "ecopasta",
    guaranteeLevel: GF,
    ingredients: ["mais"],
    isFeatured: true,
  },
  {
    slug: "ecopasta-semoule-mais",
    name: "Semoule de maïs sans gluten",
    nameAr: "سميد الذرة خالٍ من الغلوتين",
    description: "Une semoule 100 % maïs pour les gâteaux de semoule, la bouillie et les galettes.",
    descriptionAr: "سميد من الذرة بنسبة 100٪ لكعك السميد والعصيدة والفطائر.",
    price: 8000,
    unit: "1 kg",
    category: "farines-cereales",
    producer: "ecopasta",
    guaranteeLevel: GF,
    ingredients: ["mais"],
  },
  {
    slug: "ecopasta-fell-mais",
    name: "Fell (vermicelles) de maïs",
    nameAr: "فِل (شعيرية) الذرة",
    description: "Des vermicelles 100 % maïs pour la chorba et les soupes.",
    descriptionAr: "شعيرية من الذرة بنسبة 100٪ للشربة والحساء.",
    price: 5700,
    unit: "350 g",
    category: "couscous-pates",
    producer: "ecopasta",
    guaranteeLevel: GF,
    ingredients: ["mais"],
  },
  {
    slug: "ecopasta-farine-mixte-riz",
    name: "Farine mixte au riz",
    nameAr: "دقيق مختلط بالأرز",
    description: "Une farine mixte à base de riz, pour le pain et les gâteaux du quotidien.",
    descriptionAr: "دقيق مختلط أساسه الأرز، للخبز والكعك اليومي.",
    price: 11500,
    unit: "1 kg",
    category: "farines-cereales",
    producer: "ecopasta",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "ecopasta-pois-chiche-moulu",
    name: "Pois chiche moulu",
    nameAr: "حمّص مطحون",
    description: "Du pois chiche moulu pour la cuisine tunisienne : lablabi, galettes et pâtisserie salée.",
    descriptionAr: "حمّص مطحون للمطبخ التونسي: اللبلابي والفطائر والمعجنات المالحة.",
    price: 7500,
    unit: "500 g",
    category: "farines-cereales",
    producer: "ecopasta",
    guaranteeLevel: GF,
    ingredients: ["pois-chiches"],
  },
  {
    slug: "ecopasta-pates-legumes",
    name: "Pâtes aux légumes sans gluten",
    nameAr: "عجين بالخضر خالٍ من الغلوتين",
    description: "Des pâtes sans gluten aux légumes, pour un plat de pâtes rapide en semaine.",
    descriptionAr: "عجين خالٍ من الغلوتين بالخضر، لطبق عجين سريع في أيام الأسبوع.",
    price: 6000,
    unit: "500 g",
    category: "couscous-pates",
    producer: "ecopasta",
    guaranteeLevel: GF,
    ingredients: [],
    addedDaysAgo: 6,
  },

  // ---------------------------------------------------------------------------
  // La Seine — pastry shop with a dedicated gluten-free unit, El Menzah 6 / La Marsa.
  // Prices: its Glovo page.
  // ---------------------------------------------------------------------------
  {
    slug: "la-seine-makroudh",
    name: "Makroudh sans gluten",
    nameAr: "مقروض خالٍ من الغلوتين",
    description: "Le makroudh, douceur tunisienne des fêtes, préparé dans l'unité sans gluten de La Seine.",
    descriptionAr: "المقروض، حلوى المناسبات التونسية، محضّر في وحدة La Seine الخالية من الغلوتين.",
    price: 13000,
    unit: "200 g",
    category: "patisserie-tunisienne",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
    isFeatured: true,
  },
  {
    slug: "la-seine-ghrayba",
    name: "Ghrayba sans gluten",
    nameAr: "غريبة خالية من الغلوتين",
    description: "La ghrayba qui fond dans la bouche, en version sans gluten.",
    descriptionAr: "الغريبة التي تذوب في الفم، في نسخة خالية من الغلوتين.",
    price: 10600,
    unit: "200 g",
    category: "patisserie-tunisienne",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
    isFeatured: true,
  },
  {
    slug: "la-seine-biscuit-traditionnel",
    name: "Biscuit traditionnel sans gluten",
    nameAr: "بسكويت تقليدي خالٍ من الغلوتين",
    description: "Un assortiment de biscuits traditionnels tunisiens, sans gluten.",
    descriptionAr: "تشكيلة من البسكويت التونسي التقليدي، خالية من الغلوتين.",
    price: 14000,
    unit: "200 g",
    category: "patisserie-tunisienne",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "la-seine-financiers",
    name: "Financiers amande et raisins secs",
    nameAr: "فينونسيي باللوز والزبيب",
    description: "Des financiers moelleux aux amandes et aux raisins secs, sans gluten. Contient des amandes.",
    descriptionAr: "فينونسيي طرية باللوز والزبيب، خالية من الغلوتين. تحتوي على اللوز.",
    price: 16000,
    unit: "200 g",
    category: "biscuits-gateaux",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "la-seine-madeleine-marbree",
    name: "Madeleine marbrée sans gluten",
    nameAr: "مادلين مرمّر خالٍ من الغلوتين",
    description: "Des madeleines marbrées vanille-chocolat, sans gluten, pour le goûter des enfants.",
    descriptionAr: "مادلين مرمّر بالفانيليا والشوكولاتة، خالٍ من الغلوتين، للمجة الأطفال.",
    price: 10500,
    unit: "150 g",
    category: "biscuits-gateaux",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "la-seine-fondant-chocolat",
    name: "Fondant au chocolat sans gluten",
    nameAr: "فوندان بالشوكولاتة خالٍ من الغلوتين",
    description: "Un fondant au chocolat individuel, sans gluten.",
    descriptionAr: "فوندان فردي بالشوكولاتة، خالٍ من الغلوتين.",
    price: 8000,
    unit: "Pièce",
    category: "biscuits-gateaux",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
  },
  {
    slug: "la-seine-tiramisu",
    name: "Tiramisu sans gluten",
    nameAr: "تيراميسو خالٍ من الغلوتين",
    description: "Un tiramisu individuel, préparé sans gluten.",
    descriptionAr: "تيراميسو فردي محضّر دون غلوتين.",
    price: 10500,
    unit: "Pièce",
    category: "biscuits-gateaux",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
    addedDaysAgo: 9,
  },
  {
    slug: "la-seine-sandwich-tabouna",
    name: "Sandwich baguette ou tabouna « Red Heat »",
    nameAr: "سندويتش باقات أو طابونة « Red Heat »",
    description: "Un sandwich sur pain sans gluten, au choix baguette ou tabouna, pour le déjeuner.",
    descriptionAr: "سندويتش بخبز خالٍ من الغلوتين، باقات أو طابونة حسب الاختيار، للغداء.",
    price: 12000,
    unit: "Pièce",
    category: "plats-prepares",
    producer: "la-seine",
    guaranteeLevel: GF,
    ingredients: [],
  },

  // ---------------------------------------------------------------------------
  // Glucélia — gluten-free flour mixes, La Marsa (Tunis). Prices: glucelia.tn (incl. tax).
  // Its 2 other mixes (pancakes, muffins, 16 DT) are left out (6 products at most per business).
  // ---------------------------------------------------------------------------
  {
    slug: "glucelia-mix-fricasse",
    name: "Mix fricassé sans gluten",
    nameAr: "خليط الفريكاسي خالٍ من الغلوتين",
    description:
      "Une préparation pour réussir à la maison les fricassés, les petits pains frits tunisiens à garnir. Composition publiée : farines sans gluten, amidon sans gluten, émulsifiant, levure boulangère sans gluten, sel.",
    descriptionAr:
      "خليط لتحضير الفريكاسي في البيت، الخبز التونسي الصغير المقلي الذي يُحشى. المكوّنات المنشورة: دقيق خالٍ من الغلوتين، نشا خالٍ من الغلوتين، مستحلب، خميرة خبز خالية من الغلوتين، ملح.",
    price: 17000,
    unit: "320 g (20 pièces)",
    category: "farines-cereales",
    producer: "glucelia",
    guaranteeLevel: GF,
    ingredients: ["farines-sans-gluten", "amidon-sans-gluten", "emulsifiant", "levure", "sel"],
    isFeatured: true,
  },
  {
    slug: "glucelia-mix-brik-danouni",
    name: "Mix brik danouni sans gluten",
    nameAr: "خليط البريك الدنوني خالٍ من الغلوتين",
    description:
      "Une préparation pour réussir à la maison le brik danouni, une spécialité tunisienne. Composition publiée : farines sans gluten, amidon sans gluten, émulsifiant, sel.",
    descriptionAr:
      "خليط لتحضير البريك الدنوني في البيت، من الأكلات التونسية. المكوّنات المنشورة: دقيق خالٍ من الغلوتين، نشا خالٍ من الغلوتين، مستحلب، ملح.",
    price: 17000,
    unit: "320 g (20 pièces)",
    category: "farines-cereales",
    producer: "glucelia",
    guaranteeLevel: GF,
    ingredients: ["farines-sans-gluten", "amidon-sans-gluten", "emulsifiant", "sel"],
  },
  {
    slug: "glucelia-mix-batbout",
    name: "Mix batbout sans gluten",
    nameAr: "خليط خبز البطبوط خالٍ من الغلوتين",
    description:
      "Une préparation pour le batbout, le petit pain rond cuit à la poêle. Composition publiée : farines sans gluten, semoule sans gluten, amidon sans gluten, émulsifiant, levure boulangère sans gluten, sel.",
    descriptionAr:
      "خليط لتحضير خبز البطبوط، الخبز الصغير المستدير الذي يُطهى في المقلاة. المكوّنات المنشورة: دقيق خالٍ من الغلوتين، سميد خالٍ من الغلوتين، نشا خالٍ من الغلوتين، مستحلب، خميرة خبز خالية من الغلوتين، ملح.",
    price: 17000,
    unit: "320 g (30 pièces)",
    category: "farines-cereales",
    producer: "glucelia",
    guaranteeLevel: GF,
    ingredients: ["farines-sans-gluten", "semoule-sans-gluten", "amidon-sans-gluten", "emulsifiant", "levure", "sel"],
  },
  {
    slug: "glucelia-mix-bambalouni",
    name: "Mix bambalouni sans gluten",
    nameAr: "خليط البمبالوني خالٍ من الغلوتين",
    description:
      "Une préparation pour le bambalouni, le beignet tunisien saupoudré de sucre. Composition publiée : amidon sans gluten, farines sans gluten, émulsifiant, levure boulangère sans gluten, sel.",
    descriptionAr:
      "خليط لتحضير البمبالوني، الفطيرة التونسية المقلية المرشوشة بالسكر. المكوّنات المنشورة: نشا خالٍ من الغلوتين، دقيق خالٍ من الغلوتين، مستحلب، خميرة خبز خالية من الغلوتين، ملح.",
    price: 16000,
    unit: "320 g (20 pièces)",
    category: "farines-cereales",
    producer: "glucelia",
    guaranteeLevel: GF,
    ingredients: ["amidon-sans-gluten", "farines-sans-gluten", "emulsifiant", "levure", "sel"],
  },
  {
    slug: "glucelia-mix-crepes",
    name: "Mix crêpes sans gluten",
    nameAr: "خليط الكريب خالٍ من الغلوتين",
    description:
      "Une préparation pour des crêpes sans gluten à la maison. Composition publiée : farines sans gluten, amidon sans gluten, émulsifiant, sel.",
    descriptionAr:
      "خليط لتحضير الكريب الخالي من الغلوتين في البيت. المكوّنات المنشورة: دقيق خالٍ من الغلوتين، نشا خالٍ من الغلوتين، مستحلب، ملح.",
    price: 16000,
    unit: "220 g (10 personnes)",
    category: "farines-cereales",
    producer: "glucelia",
    guaranteeLevel: GF,
    ingredients: ["farines-sans-gluten", "amidon-sans-gluten", "emulsifiant", "sel"],
  },
  {
    slug: "glucelia-mix-genoise",
    name: "Mix génoise sans gluten",
    nameAr: "خليط الجينواز خالٍ من الغلوتين",
    description:
      "Une préparation pour la génoise, la base des gâteaux d'anniversaire et des gâteaux roulés. Composition publiée : amidon sans gluten, farines sans gluten, émulsifiant, levure sans gluten.",
    descriptionAr:
      "خليط لتحضير الجينواز، أساس كعك أعياد الميلاد والكعك الملفوف. المكوّنات المنشورة: نشا خالٍ من الغلوتين، دقيق خالٍ من الغلوتين، مستحلب، خميرة خالية من الغلوتين.",
    price: 16000,
    unit: "220 g (6 personnes)",
    category: "farines-cereales",
    producer: "glucelia",
    guaranteeLevel: GF,
    ingredients: ["amidon-sans-gluten", "farines-sans-gluten", "emulsifiant", "levure-sans-gluten"],
  },

  // ---------------------------------------------------------------------------
  // EMELY (Trés'OR Oasien) — family date producer, Rjim Maatoug (Kébili). Prices: its ILEYCOM shop.
  // The "bio" claims are left out (no certifying body named). Left out: zrir, date powder and
  // date-pit coffee (where they are ground is not published), syrup (no price per size).
  // ---------------------------------------------------------------------------
  {
    slug: "emely-creme-cacahu-datte",
    name: "Crème Cacahu-Datte",
    nameAr: "كريمة الفول السوداني والتمر",
    description:
      "Une pâte à tartiner de cacahuètes et de dattes Deglet Nour, que le producteur annonce sans gluten, sans sucre raffiné, sans sel ajouté et sans huile. Composition publiée : cacahuètes, dattes Deglet Nour.",
    descriptionAr:
      "كريمة للدهن من الفول السوداني وتمر دقلة النور، يعلن المنتج أنها خالية من الغلوتين ودون سكر مكرّر ودون ملح مضاف ودون زيوت. المكوّنات المنشورة: فول سوداني، تمر دقلة النور.",
    price: 19400,
    unit: "250 g",
    category: "dattes",
    producer: "emely-tresor-oasien",
    guaranteeLevel: GF,
    ingredients: ["arachides", "dattes"],
  },
  {
    slug: "emely-creme-chami-datte-sesame",
    name: "Crème à tartiner Chami Datté Sésame",
    nameAr: "كريمة « شامي » للدهن بالتمر والسمسم",
    description:
      "Une crème à tartiner de dattes Deglet Nour et de sésame, présentée par le producteur comme « produit sans gluten ». Composition publiée : dattes Deglet Nour, sésame.",
    descriptionAr:
      "كريمة للدهن من تمر دقلة النور والسمسم، يقدّمها المنتج على أنها « منتج خالٍ من الغلوتين ». المكوّنات المنشورة: تمر دقلة النور، سمسم.",
    price: 20000,
    unit: "250 g",
    category: "dattes",
    producer: "emely-tresor-oasien",
    guaranteeLevel: GF,
    ingredients: ["dattes", "sesame"],
  },
  {
    slug: "emely-choco-datte",
    name: "Choco-Datte, pâte à tartiner dattes-noisettes",
    nameAr: "شوكو-تمر، كريمة للدهن بالتمر والبندق",
    description:
      "Une pâte à tartiner de dattes et de noisettes torréfiées. Composition publiée : dattes, noisette torréfiée.",
    descriptionAr: "كريمة للدهن من التمر والبندق المحمّص. المكوّنات المنشورة: تمر، بندق محمّص.",
    price: 18000,
    unit: "250 g",
    category: "dattes",
    producer: "emely-tresor-oasien",
    guaranteeLevel: GF,
    ingredients: ["dattes", "noisettes"],
  },
  {
    slug: "emely-confiture-deglet-nour",
    name: "Confiture de dattes Deglet Nour",
    nameAr: "معجون تمر دقلة النور",
    description:
      "Une confiture de dattes Deglet Nour, à tartiner au petit-déjeuner. Composition publiée : 100 % dattes Deglet Nour.",
    descriptionAr: "معجون من تمر دقلة النور، للدهن في فطور الصباح. المكوّنات المنشورة: تمر دقلة النور بنسبة 100٪.",
    price: 15000,
    unit: "300 g",
    category: "dattes",
    producer: "emely-tresor-oasien",
    guaranteeLevel: GF,
    ingredients: ["dattes"],
  },
  {
    slug: "emely-vinaigre-de-dattes",
    name: "Vinaigre de dattes artisanal",
    nameAr: "خلّ التمر التقليدي",
    description:
      "Un vinaigre artisanal obtenu par double fermentation spontanée de dattes, en bouteille en verre (volume non indiqué). Composition publiée : dattes.",
    descriptionAr:
      "خلّ تقليدي يُحضَّر بتخمير التمر تخميرًا طبيعيًا مزدوجًا، في قارورة زجاجية (السعة غير مذكورة). المكوّنات المنشورة: تمر.",
    price: 15000,
    unit: "Bouteille",
    category: "epicerie-condiments",
    producer: "emely-tresor-oasien",
    guaranteeLevel: GF,
    ingredients: ["dattes"],
  },
  {
    slug: "emely-jus-deglet-nour",
    name: "Jus de dattes Deglet Nour",
    nameAr: "عصير تمر دقلة النور",
    description: "Un jus de dattes Deglet Nour, en bouteille en verre.",
    descriptionAr: "عصير تمر دقلة النور، في قارورة زجاجية.",
    price: 5200,
    unit: "300 ml",
    category: "dattes",
    producer: "emely-tresor-oasien",
    guaranteeLevel: GF,
    ingredients: [],
  },

  // ---------------------------------------------------------------------------
  // Miellogène — raw honey, La Marsa (Tunis). Prices: its ILEYCOM shop (promotional prices,
  // Nov. 2026). The 480 g jars (52 DT) are only mentioned in the descriptions, without their price.
  // ---------------------------------------------------------------------------
  {
    slug: "miellogene-miel-eucalyptus-sejnan",
    name: "Miel d'eucalyptus brut de Sejnan",
    nameAr: "عسل الأوكالبتوس الخام من سجنان",
    description:
      "Un miel d'eucalyptus brut de la région de Sejnan, non pasteurisé, non chauffé et non filtré selon la marque. Existe aussi en pot de 480 g.",
    descriptionAr:
      "عسل أوكالبتوس خام من جهة سجنان، غير مبستر وغير مسخّن وغير مصفّى حسب العلامة. متوفّر أيضًا في وعاء 480 غ.",
    price: 30000,
    unit: "240 g",
    category: "epicerie-condiments",
    producer: "miellogene",
    guaranteeLevel: GF,
    ingredients: ["miel"],
  },
  {
    slug: "miellogene-miel-coriandre-cap-bon",
    name: "Miel de coriandre brut du Cap Bon",
    nameAr: "عسل الكسبر الخام من الوطن القبلي",
    description:
      "Un miel de coriandre brut du Cap Bon, non pasteurisé, non chauffé et non filtré selon la marque. Existe aussi en pot de 480 g.",
    descriptionAr:
      "عسل كسبر خام من الوطن القبلي، غير مبستر وغير مسخّن وغير مصفّى حسب العلامة. متوفّر أيضًا في وعاء 480 غ.",
    price: 30000,
    unit: "240 g",
    category: "epicerie-condiments",
    producer: "miellogene",
    guaranteeLevel: GF,
    ingredients: ["miel"],
  },
];
