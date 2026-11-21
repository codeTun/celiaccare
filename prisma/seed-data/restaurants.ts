/**
 * Restaurants and their menus: REAL 100 % gluten-free restaurants in Tunisia, researched on
 * public sources on 2026-11-21 (official menu, Atly, Find Me Gluten Free, Google listings).
 * Only two restaurants in Tunisia could be confirmed as 100 % gluten-free.
 *
 * - Facts (address, phone, hours, menu, prices) only as published; `verificationSource` says where.
 * - A restaurant with published prices can be a "partner" in the demo (`partnerSinceMonthsAgo`
 *   set: online ordering). Without published prices, it is listed in the directory only, with no
 *   dishes. These restaurants are NOT real partners of CeliacCare (the site shows a demo notice).
 * - Delivery is free on CeliacCare: `deliveryFee` is always 0 (the server ignores it anyway).
 * - Prices and minimum orders are in MILLIMES (28000 = 28,000 DT).
 * - Dish `ingredients`: the main ingredients written on the menu (allergens highlighted).
 * - `verifiedMonthsAgo` / `joinedMonthsAgo`: see producers.ts.
 */
import type { Governorate } from "../../lib/tunisia";
import type { DishCourse, GuaranteeLevel } from "../../types/enums";

export type SeedDish = {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  /** Price in millimes. */
  price: number;
  course: DishCourse;
  /** Ingredient slugs (ingredients.ts). */
  ingredients: string[];
  /** false = not served at the moment (default: true). */
  isAvailable?: boolean;
};

export type SeedRestaurant = {
  slug: string;
  name: string;
  description: string;
  descriptionAr: string;
  cuisine: string;
  city: string;
  governorate: Governorate;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  openingHours: string | null;
  guaranteeLevel: GuaranteeLevel;
  dedicatedKitchen: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  verificationSource: string;
  verifiedMonthsAgo: number;
  joinedMonthsAgo: number;
  /** 1 = €, 2 = €€, 3 = €€€ */
  priceRange: 1 | 2 | 3;
  /** null = directory only (no online ordering). */
  partnerSinceMonthsAgo: number | null;
  /** Always 0: delivery is free on CeliacCare. */
  deliveryFee: number;
  deliveryTime: string;
  minOrder: number;
  dishes: SeedDish[];
};

export const RESTAURANTS: SeedRestaurant[] = [
  // ---------------------------------------------------------------------------
  {
    slug: "inward",
    name: "InwaЯd",
    description:
      "Restaurant végétal « raw & living » des Berges du Lac, qui prépare tout maison : fromages de noix fermentés, pains au levain de sarrasin, crackers germés. La carte affiche « 0 % gluten » et exclut aussi les produits laitiers, les œufs et le sucre raffiné. Pensez à signaler vos allergies (fruits à coque très présents).",
    descriptionAr:
      "مطعم نباتي « نيء وحيّ » في ضفاف البحيرة، يحضّر كل شيء في مطبخه: أجبان مخمّرة من المكسّرات، خبز بخميرة الحنطة السوداء، بسكويت مالح من البذور المنبّتة. قائمته « 0٪ غلوتين » ولا تحتوي أيضًا على الحليب ومشتقاته والبيض والسكر المكرّر. نبّهوا إلى حساسيّتكم (المكسّرات حاضرة بكثرة).",
    cuisine: "Végétale crue & healthy",
    city: "Les Berges du Lac",
    governorate: "Tunis",
    address: "Passage du Lac Volta, Les Berges du Lac, 1053 Tunis",
    latitude: 36.837523,
    longitude: 10.240361,
    phone: "50530531",
    whatsapp: null,
    email: null,
    website: "https://inward.tn/",
    instagram: "https://www.instagram.com/inward11/",
    facebook: null,
    openingHours: "Mar – Ven · 12h – 16h30 (horaires à confirmer)",
    guaranteeLevel: "DEDICATED",
    dedicatedKitchen: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Carte officielle « Summer 26 » (inward.tn) : « 0% Gluten » · fiche Atly « 100% Dedicated Gluten-Free »",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 8,
    priceRange: 3,
    partnerSinceMonthsAgo: 5,
    deliveryFee: 0,
    deliveryTime: "45–60 min",
    minOrder: 40000,
    dishes: [
      {
        name: "Jolly Cow Cheese",
        nameAr: "جبن « جولي كاو » نباتي",
        description:
          "Fromage végétal fermenté de cajou, d'amandes et de tournesol germés, avec des crackers germés et un caramel de dattes.",
        descriptionAr: "جبن نباتي مخمّر من الكاجو واللوز وعبّاد الشمس المنبّت، مع بسكويت مالح منبّت وكراميل التمر.",
        price: 38500,
        course: "STARTER",
        ingredients: ["noix-de-cajou", "amandes", "graines-de-tournesol", "dattes"],
      },
      {
        name: "Jungle Burger (plat déstructuré)",
        nameAr: "برغر « الأدغال » (طبق مفكّك)",
        description:
          "Pâté de graines de courge et de tournesol germées, houmous germé, choucroute et galettes amande-tournesol.",
        descriptionAr: "عجينة من بذور القرع وعبّاد الشمس المنبّتة، حمّص منبّت، ملفوف مخمّر وفطائر لوز وعبّاد الشمس.",
        price: 43500,
        course: "MAIN",
        ingredients: ["graines-de-courge", "graines-de-tournesol", "pois-chiches", "chou", "amandes"],
      },
      {
        name: "Fritter (plat déstructuré)",
        nameAr: "فطيرة الحمّص والسبانخ (طبق مفكّك)",
        description: "Galette de pois chiche germé et d'épinards, yaourt de cajou, avocat et pikliz.",
        descriptionAr: "فطيرة من الحمّص المنبّت والسبانخ، ياغورت الكاجو، أفوكادو وخضر مخلّلة حارّة.",
        price: 49500,
        course: "MAIN",
        ingredients: ["pois-chiches", "epinards", "noix-de-cajou", "avocat"],
      },
      {
        name: "Live Falafel Wrap (plat déstructuré)",
        nameAr: "لفافة الفلافل (طبق مفكّك)",
        description:
          "Falafels de pois chiche et d'amandes germés, pain plat de sarrasin germé et crème de cajou.",
        descriptionAr: "فلافل من الحمّص واللوز المنبّت، خبز مسطّح من الحنطة السوداء المنبّتة وكريمة الكاجو.",
        price: 47500,
        course: "MAIN",
        ingredients: ["pois-chiches", "amandes", "sarrasin", "noix-de-cajou"],
      },
      {
        name: "Sourdough English Muffins",
        nameAr: "مافن بالخميرة الطبيعية",
        description:
          "Muffins au levain de sarrasin (millet, riz complet, sarrasin), ricotta d'amande et avocat.",
        descriptionAr: "مافن بخميرة الحنطة السوداء (دخن، أرز كامل، حنطة سوداء)، ريكوتا اللوز وأفوكادو.",
        price: 56500,
        course: "MAIN",
        ingredients: ["millet", "riz-complet", "sarrasin", "amandes", "avocat"],
      },
      {
        name: "Brownie au cacao & chantilly coco-vanille",
        nameAr: "براوني بالكاكاو وكريمة جوز الهند بالفانيليا",
        description: "Brownie de noix et d'amandes germées au cacao cru, crème de coco et dattes.",
        descriptionAr: "براوني من الجوز واللوز المنبّت بالكاكاو النيء، كريمة جوز الهند والتمر.",
        price: 22500,
        course: "DESSERT",
        ingredients: ["noix", "amandes", "cacao", "noix-de-coco", "dattes"],
      },
      {
        name: "Pancakes sarrasin & matcha",
        nameAr: "بانكيك بالحنطة السوداء والماتشا",
        description: "Pancakes de sarrasin germé au matcha, yaourt coco-cajou et fruits frais.",
        descriptionAr: "بانكيك من الحنطة السوداء المنبّتة بالماتشا، ياغورت جوز الهند والكاجو وفواكه طازجة.",
        price: 44000,
        course: "DESSERT",
        ingredients: ["sarrasin", "matcha", "noix-de-coco", "noix-de-cajou", "fruits"],
      },
      {
        name: "Kombucha bio",
        nameAr: "كومبوتشا بيولوجي",
        description: "Kombucha maison au thé vert Bancha et au thé noir Keemun, sucre bio non raffiné.",
        descriptionAr: "كومبوتشا منزلية بالشاي الأخضر بانشا والشاي الأسود كيمون، وسكر بيولوجي غير مكرّر.",
        price: 17500,
        course: "DRINK",
        ingredients: ["the", "sucre"],
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "tik-tak-family",
    name: "Tik Tak Family",
    description:
      "Petite adresse familiale entre Carthage et La Marsa dont toute la carte est annoncée sans gluten : crêpes, pizzas, gaufres et sandwichs de type mlawi. Sa carte et ses prix ne sont pas publiés en ligne ; les clients signalent une attente parfois longue.",
    descriptionAr:
      "عنوان عائلي صغير بين قرطاج والمرسى، كل قائمته معلنة خالية من الغلوتين: كريب، بيتزا، وافل وسندويتشات ملاوي. قائمته وأسعاره غير منشورة على الإنترنت، ويذكر الزبائن أن الانتظار قد يطول أحيانًا.",
    cuisine: "Crêpes, pizzas & sandwichs",
    city: "Carthage",
    governorate: "Tunis",
    address: "Rue Tahar Ben Achour, 2078 Carthage",
    latitude: 36.8790052,
    longitude: 10.3262902,
    phone: "50934906",
    whatsapp: "50934906",
    email: null,
    website: null,
    instagram: null,
    facebook: "https://www.facebook.com/TikaTakFamily",
    openingHours: "Lun – Jeu · 12h – 22h · Ven – Sam · 12h – 23h · Dim · 17h – 22h",
    guaranteeLevel: "DEDICATED",
    dedicatedKitchen: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource:
      "Fiche Atly « 100% Dedicated Gluten-Free » (vérifiée par Atly) · Find Me Gluten Free « Dedicated Gluten-Free Restaurant » · fiche Google",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 3,
    priceRange: 2,
    partnerSinceMonthsAgo: null,
    deliveryFee: 0,
    deliveryTime: "45–60 min",
    minOrder: 0,
    dishes: [],
  },
];
