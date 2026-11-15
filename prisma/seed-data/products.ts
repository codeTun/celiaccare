/**
 * Products sold by the small businesses of producers.ts (demo data).
 *
 * - `slug` is the unique key: the seed finds an existing product by its slug.
 * - `price` is in MILLIMES (1 DT = 1000 millimes): 9800 means 9,800 DT.
 * - `category`, `producer` and `ingredients` refer to slugs of the other data files.
 * - A CERTIFIED product needs a `certification` text. The certificates below are
 *   FICTIONAL demo numbers: never write the name of a real certification body here.
 * - `mayContain` is shown as "Peut contenir des traces de : ..." (cross-contamination).
 * - Products made of a single ingredient (dates, olive oil...) list only that ingredient:
 *   people with allergies rely on these lists, so never pad them.
 * - `addedDaysAgo` marks a recent product (shown first in "Nouveautés"). Without it, the
 *   product is considered as added when its producer joined the platform.
 * - Photos are not seeded: the site shows a branded placeholder until the admin uploads one.
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
  /** Ingredient slugs (ingredients.ts), main ingredient first. */
  ingredients: string[];
  isFeatured?: boolean;
  /** false = temporarily out of stock (default: true). */
  isAvailable?: boolean;
  /** false = hidden from the public site (default: true). */
  isActive?: boolean;
  addedDaysAgo?: number;
};

const CERT_FOURNIL_YASMINE = "Certificat sans gluten (démo) — n° CC-2026-014";
const CERT_EPI_LIBRE = "Certificat sans gluten (démo) — n° CC-2026-021";
const CERT_PATISSERIE_LILIA = "Certificat sans gluten (démo) — n° CC-2025-087";

export const PRODUCTS: SeedProduct[] = [
  // ---------------------------------------------------------------------------
  // Fournil Yasmine — bakery, La Marsa (Tunis)
  // ---------------------------------------------------------------------------
  {
    slug: "pain-de-mie-riz-sarrasin",
    name: "Pain de mie au riz et au sarrasin",
    nameAr: "خبز توست بالأرز والحنطة السوداء",
    description:
      "Un pain de mie moelleux et tranché, qui se garde trois jours dans son sachet. Parfait pour les sandwichs de l'école et le petit-déjeuner, grillé ou nature.",
    descriptionAr: "خبز توست طري ومقطّع يُحفظ ثلاثة أيام في كيسه. مثالي لسندويتشات المدرسة ولفطور الصباح، محمّصًا أو كما هو.",
    price: 9800,
    unit: "500 g",
    category: "pains-viennoiseries",
    producer: "fournil-yasmine",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_FOURNIL_YASMINE,
    ingredients: ["farine-de-riz", "sarrasin", "fecule-de-pomme-de-terre", "psyllium", "levure", "huile-d-olive"],
    isFeatured: true,
  },
  {
    slug: "baguette-sans-gluten",
    name: "Baguette sans gluten",
    nameAr: "خبز باقات خالٍ من الغلوتين",
    description:
      "Croûte dorée et mie alvéolée : une vraie baguette cuite sur sole chaque matin. À réchauffer cinq minutes au four pour retrouver son croustillant.",
    descriptionAr: "قشرة ذهبية ولبّ هشّ: باقات حقيقية تُخبز كل صباح. تُسخَّن خمس دقائق في الفرن لتستعيد قرمشتها.",
    price: 3800,
    unit: "La pièce (250 g)",
    category: "pains-viennoiseries",
    producer: "fournil-yasmine",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_FOURNIL_YASMINE,
    ingredients: ["farine-de-riz", "mais", "fecule-de-pomme-de-terre", "psyllium", "levure", "sel"],
  },
  {
    slug: "croissants-pur-beurre",
    name: "Croissants pur beurre",
    nameAr: "كرواسون بالزبدة",
    description:
      "Des croissants feuilletés au beurre et dorés à l'œuf, livrés par boîte de quatre. Ils se congèlent très bien : huit minutes au four et le petit-déjeuner est servi.",
    descriptionAr: "كرواسون مورّق بالزبدة ومدهون بالبيض، في علبة من أربع قطع. يُجمَّد بسهولة ويكفي تسخينه ثماني دقائق في الفرن.",
    price: 12000,
    unit: "Boîte de 4",
    category: "pains-viennoiseries",
    producer: "fournil-yasmine",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_FOURNIL_YASMINE,
    ingredients: ["farine-de-riz", "fecule-de-pomme-de-terre", "beurre", "oeufs", "lait", "sucre"],
  },
  {
    slug: "pain-rond-au-sorgho",
    name: "Pain rond au sorgho",
    nameAr: "خبز مستدير بالدرع",
    description:
      "Une miche à la farine de sorgho et à l'huile d'olive, au goût légèrement noisette. Idéale pour saucer une ojja ou accompagner une chorba.",
    descriptionAr: "خبزة بدقيق الدرع وزيت الزيتون بنكهة خفيفة تشبه البندق. مثالية لتغميس العجّة أو مرافقة الشربة.",
    price: 5500,
    unit: "La pièce (400 g)",
    category: "pains-viennoiseries",
    producer: "fournil-yasmine",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_FOURNIL_YASMINE,
    ingredients: ["sorgho", "farine-de-riz", "levure", "huile-d-olive", "sel"],
  },
  {
    slug: "feuilles-de-brik-sans-gluten",
    name: "Feuilles de brik sans gluten (malsouka)",
    nameAr: "ورقة ملسوقة خالية من الغلوتين",
    description:
      "Des feuilles fines et souples à base de farine de riz, qui croustillent à la friture comme au four. Pour les briks à l'œuf, les bourek et les samsa du Ramadan.",
    descriptionAr: "أوراق رقيقة ولينة بدقيق الأرز، تصبح مقرمشة في القلي كما في الفرن. للبريك بالبيض والبوراك وصمصة رمضان.",
    price: 6500,
    unit: "Paquet de 10 feuilles",
    category: "couscous-pates",
    producer: "fournil-yasmine",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_FOURNIL_YASMINE,
    ingredients: ["farine-de-riz", "fecule-de-pomme-de-terre", "huile-d-olive", "sel"],
  },
  {
    slug: "pizza-margherita-surgelee",
    name: "Pizza margherita surgelée",
    nameAr: "بيتزا مارغريتا مجمّدة",
    description:
      "Pâte fine au riz, sauce tomate maison et mozzarella, précuite au four à pierre puis surgelée. Douze minutes à 220 °C et elle est prête.",
    descriptionAr: "عجينة رقيقة بالأرز وصلصة طماطم منزلية وموزاريلا، مطهوة مسبقًا في فرن حجري ثم مجمّدة. 12 دقيقة على 220 درجة وتكون جاهزة.",
    price: 13500,
    unit: "La pièce (Ø 28 cm)",
    category: "plats-prepares",
    producer: "fournil-yasmine",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_FOURNIL_YASMINE,
    ingredients: ["farine-de-riz", "fecule-de-pomme-de-terre", "tomate", "fromage", "huile-d-olive", "levure"],
  },

  // ---------------------------------------------------------------------------
  // Épi Libre — specialty shop with a gluten-free workshop, Mutuelleville (Tunis)
  // ---------------------------------------------------------------------------
  {
    slug: "farine-sans-gluten-tout-usage",
    name: "Farine sans gluten tout usage",
    nameAr: "دقيق خالٍ من الغلوتين متعدد الاستعمالات",
    description:
      "Un mélange équilibré de riz, de maïs et de fécule, enrichi en psyllium pour lier les pâtes. Il remplace la farine de blé à poids égal dans les gâteaux, les crêpes et les sauces.",
    descriptionAr: "خليط متوازن من الأرز والذرة والنشا، مدعّم بالسيليوم لتماسك العجين. يعوّض دقيق القمح بنفس الوزن في المرطبات والكريب والصلصات.",
    price: 11500,
    unit: "1 kg",
    category: "farines-cereales",
    producer: "epi-libre",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_EPI_LIBRE,
    ingredients: ["farine-de-riz", "mais", "fecule-de-pomme-de-terre", "psyllium"],
  },
  {
    slug: "farine-de-pois-chiches",
    name: "Farine de pois chiches",
    nameAr: "دقيق الحمص",
    description:
      "Pois chiches tunisiens moulus finement dans l'atelier sans gluten de la boutique. La base de la ghraiba au pois chiche, des crêpes salées et des beignets.",
    descriptionAr: "حمص تونسي مطحون ناعمًا في ورشة المحل الخالية من الغلوتين. أساس غريبة الحمص والكريب المالح والفطائر.",
    price: 5200,
    unit: "500 g",
    category: "farines-cereales",
    producer: "epi-libre",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["pois-chiches"],
  },
  {
    slug: "melange-pain-maison",
    name: "Mélange pour pain maison",
    nameAr: "خليط لتحضير الخبز في المنزل",
    description:
      "Farines de sarrasin et de riz, fécule, psyllium et levure déjà dosés : il suffit d'ajouter de l'eau tiède et un filet d'huile d'olive. La recette du pain rond est imprimée au dos du sachet.",
    descriptionAr: "دقيق الحنطة السوداء ودقيق الأرز والنشا والسيليوم والخميرة بمقادير جاهزة: يكفي إضافة الماء الدافئ وقليل من زيت الزيتون. وصفة الخبز المستدير مطبوعة خلف الكيس.",
    price: 8900,
    unit: "1 kg",
    category: "farines-cereales",
    producer: "epi-libre",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_EPI_LIBRE,
    ingredients: ["sarrasin", "farine-de-riz", "fecule-de-pomme-de-terre", "psyllium", "levure"],
  },
  {
    slug: "spaghetti-riz-mais",
    name: "Spaghetti de riz et maïs",
    nameAr: "سباغيتي بالأرز والذرة",
    description:
      "Des spaghetti qui tiennent la cuisson et ne collent pas, séchés lentement à basse température. Ils prennent très bien une sauce tomate relevée à la harissa.",
    descriptionAr: "سباغيتي تحافظ على قوامها عند الطهي ولا تلتصق، مجففة ببطء على حرارة منخفضة. تمتص صلصة الطماطم بالهريسة بشكل رائع.",
    price: 7900,
    unit: "500 g",
    category: "couscous-pates",
    producer: "epi-libre",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_EPI_LIBRE,
    ingredients: ["farine-de-riz", "mais"],
  },
  {
    slug: "granola-miel-amandes",
    name: "Granola au miel et aux amandes",
    nameAr: "غرانولا بالعسل واللوز",
    description:
      "Flocons d'avoine certifiée sans gluten, amandes, noisettes et dattes, dorés au four avec du miel de thym et un filet d'huile d'olive. Croustillant avec du lait ou un yaourt.",
    descriptionAr: "رقائق شوفان معتمد خالٍ من الغلوتين ولوز وبندق وتمر، محمّصة في الفرن بعسل الزعتر وقليل من زيت الزيتون. مقرمشة مع الحليب أو الياغورت.",
    price: 16500,
    unit: "400 g",
    category: "petit-dejeuner",
    producer: "epi-libre",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_EPI_LIBRE,
    ingredients: ["avoine-sans-gluten", "miel", "amandes", "noisettes", "dattes", "huile-d-olive"],
    isFeatured: true,
  },
  {
    slug: "crackers-lin-sarrasin",
    name: "Crackers aux graines de lin et au sarrasin",
    nameAr: "بسكويت مالح ببذور الكتان والحنطة السوداء",
    description:
      "Des crackers fins et très croquants, riches en graines de lin et de sésame. À tartiner de houmous ou à tremper dans une salade méchouia.",
    descriptionAr: "بسكويت مالح رقيق ومقرمش جدًا، غني ببذور الكتان والسمسم. يُدهن بالحمص أو يُغمس في سلاطة مشوية.",
    price: 6800,
    unit: "150 g",
    category: "snacks-aperitifs",
    producer: "epi-libre",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_EPI_LIBRE,
    ingredients: ["graines-de-lin", "sarrasin", "farine-de-riz", "sesame", "huile-d-olive", "sel"],
  },
  {
    slug: "chips-de-pois-chiches",
    name: "Chips de pois chiches au piment doux",
    nameAr: "رقائق الحمص بالفلفل الحلو",
    description:
      "Des chips cuites au four à base de farine de pois chiches, assaisonnées au piment doux du Cap Bon. Deux fois moins grasses que des chips classiques.",
    descriptionAr: "رقائق مخبوزة في الفرن بدقيق الحمص، متبّلة بالفلفل الحلو من الوطن القبلي. أقل دسمًا بمرتين من الرقائق العادية.",
    price: 4500,
    unit: "100 g",
    category: "snacks-aperitifs",
    producer: "epi-libre",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_EPI_LIBRE,
    ingredients: ["pois-chiches", "farine-de-riz", "piment", "huile-d-olive", "sel"],
    addedDaysAgo: 12,
  },

  // ---------------------------------------------------------------------------
  // Les Douceurs de Mounira — home pastry maker, Ennasr (Ariana)
  // ---------------------------------------------------------------------------
  {
    slug: "ghraiba-pois-chiche",
    name: "Ghraiba au pois chiche",
    nameAr: "غريبة بالحمص",
    description:
      "La ghraiba homs qui fond sous la langue, naturellement sans gluten, préparée avec du beurre clarifié et du sucre glace. Une recette de famille de Mounira.",
    descriptionAr: "غريبة الحمص التي تذوب في الفم، خالية من الغلوتين بطبيعتها، محضّرة بالسمن والسكر الناعم. وصفة عائلية من منيرة.",
    price: 14000,
    unit: "Boîte de 12",
    category: "patisserie-tunisienne",
    producer: "douceurs-de-mounira",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["pois-chiches", "sucre", "beurre"],
    isFeatured: true,
  },
  {
    slug: "makroudh-dattes-sans-gluten",
    name: "Makroudh aux dattes sans gluten",
    nameAr: "مقروض بالتمر خالٍ من الغلوتين",
    description:
      "Losanges de semoule de maïs fourrés à la pâte de dattes, frits puis trempés dans le miel parfumé à la fleur d'oranger. Croustillants dehors, fondants dedans.",
    descriptionAr: "معيّنات من سميد الذرة محشوة بعجينة التمر، مقلية ثم مغموسة في العسل المعطّر بماء الزهر. مقرمشة من الخارج وطرية من الداخل.",
    price: 18000,
    unit: "500 g",
    category: "patisserie-tunisienne",
    producer: "douceurs-de-mounira",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["mais", "farine-de-riz", "dattes", "huile-d-olive", "miel", "eau-de-fleur-d-oranger"],
  },
  {
    slug: "kaak-warka-sans-gluten",
    name: "Kaak warka sans gluten",
    nameAr: "كعك ورقة خالٍ من الغلوتين",
    description:
      "Anneaux de pâte fine garnis de pâte d'amande parfumée à l'eau de fleur d'oranger, comme à Zaghouan. Une pâtisserie de fête préparée uniquement sur commande.",
    descriptionAr: "حلقات من عجين رقيق محشوة بعجينة اللوز المعطّرة بماء الزهر، على طريقة زغوان. حلويات المناسبات تُحضَّر حسب الطلب فقط.",
    price: 22000,
    unit: "Boîte de 10",
    category: "patisserie-tunisienne",
    producer: "douceurs-de-mounira",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["amandes", "sucre", "eau-de-fleur-d-oranger", "farine-de-riz", "fecule-de-pomme-de-terre", "beurre"],
  },
  {
    slug: "baklawa-amandes",
    name: "Baklawa aux amandes",
    nameAr: "بقلاوة باللوز",
    description:
      "Feuilles de riz beurrées, amandes concassées et sirop de miel : une baklawa généreuse, coupée en losanges. Disponible pour les fêtes, sur commande, avec dix jours de délai.",
    descriptionAr: "أوراق أرز مدهونة بالزبدة ولوز مدقوق وشراب العسل: بقلاوة سخية مقطّعة على شكل معيّنات. متوفرة في المناسبات حسب الطلب بأجل عشرة أيام.",
    price: 35000,
    unit: "Boîte de 500 g",
    category: "patisserie-tunisienne",
    producer: "douceurs-de-mounira",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["amandes", "farine-de-riz", "beurre", "miel", "sucre", "eau-de-fleur-d-oranger"],
    isAvailable: false, // made only for the holidays
  },

  // ---------------------------------------------------------------------------
  // Supérette El Amen — neighbourhood grocery, El Mourouj (Ben Arous)
  // ---------------------------------------------------------------------------
  {
    slug: "bsissa-sorgho-pois-chiches",
    name: "Bsissa sorgho et pois chiches",
    nameAr: "بسيسة بالدرع والحمص",
    description:
      "Bsissa moulue à la demande en magasin : sorgho et pois chiches torréfiés, fenugrec, anis et cumin. Le moulin sert aussi pour la bsissa au blé, d'où le risque de traces.",
    descriptionAr: "بسيسة تُطحن عند الطلب في المحل: درع وحمص محمّصان مع الحلبة واليانسون والكمون. تُستعمل المطحنة أيضًا لبسيسة القمح، ومن هنا خطر وجود آثار.",
    price: 8500,
    unit: "500 g",
    category: "petit-dejeuner",
    producer: "superette-el-amen",
    guaranteeLevel: "TRACES_RISK",
    mayContain: "blé et orge (moulin partagé)",
    ingredients: ["sorgho", "pois-chiches", "fenugrec", "anis-vert", "cumin"],
  },
  {
    slug: "halwa-chamia-pistaches",
    name: "Halwa chamia aux pistaches",
    nameAr: "حلوى شامية بالفستق",
    description:
      "Halwa de sésame artisanale vendue à la coupe, généreuse en pistaches. Elle est découpée sur le même plan de travail que d'autres confiseries : risque de traces.",
    descriptionAr: "حلوى شامية بالسمسم تقليدية تُباع بالوزن، غنية بالفستق. تُقطّع على نفس طاولة العمل مع حلويات أخرى، لذا يوجد خطر آثار.",
    price: 9900,
    unit: "400 g",
    category: "petit-dejeuner",
    producer: "superette-el-amen",
    guaranteeLevel: "TRACES_RISK",
    mayContain: "gluten et arachides",
    ingredients: ["sesame", "sucre", "pistaches"],
  },
  {
    slug: "pois-chiches-grilles-leblebi",
    name: "Pois chiches grillés salés (leblebi)",
    nameAr: "حمص محمّص مملّح",
    description:
      "Les pois chiches grillés du kiosque, salés et relevés d'une pointe de cumin. Vendus en vrac à côté d'autres graines grillées : à éviter en cas de sensibilité forte.",
    descriptionAr: "حمص محمّص كالذي يُباع في الكشك، مملّح ومتبّل بقليل من الكمون. يُباع بالوزن بجانب حبوب محمّصة أخرى: يُستحسن تجنّبه في حالة الحساسية الشديدة.",
    price: 2800,
    unit: "200 g",
    category: "snacks-aperitifs",
    producer: "superette-el-amen",
    guaranteeLevel: "TRACES_RISK",
    mayContain: "gluten, arachides et sésame (vente en vrac)",
    ingredients: ["pois-chiches", "sel", "cumin"],
  },
  {
    slug: "couscous-de-mais-fin",
    name: "Couscous de maïs fin",
    nameAr: "كسكسي ذرة رقيق",
    description:
      "Couscous de maïs à grain fin, en sachet scellé, qui gonfle bien à la vapeur. Parfait avec une sauce au poisson ou aux légumes.",
    descriptionAr: "كسكسي ذرة بحبة رقيقة في كيس مغلق، ينتفخ جيدًا على البخار. مثالي مع صلصة السمك أو الخضر.",
    price: 6900,
    unit: "1 kg",
    category: "couscous-pates",
    producer: "superette-el-amen",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["mais", "sel"],
  },

  // ---------------------------------------------------------------------------
  // Coopérative Nisaa Cap Bon — women's cooperative, Korba (Nabeul)
  // ---------------------------------------------------------------------------
  {
    slug: "harissa-traditionnelle-cap-bon",
    name: "Harissa traditionnelle du Cap Bon",
    nameAr: "هريسة تقليدية من الوطن القبلي",
    description:
      "Piments séchés au soleil de Korba, pilés avec l'ail, le carvi et la coriandre puis couverts d'huile d'olive. Une harissa puissante et parfumée, sans conservateur.",
    descriptionAr: "فلفل مجفّف تحت شمس قربة، مدقوق بالثوم والكروية والكسبر ومغطّى بزيت الزيتون. هريسة قوية وعطرة دون مواد حافظة.",
    price: 7500,
    unit: "Bocal de 380 g",
    category: "epicerie-condiments",
    producer: "cooperative-nisaa-cap-bon",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["piment", "ail", "carvi", "coriandre", "sel", "huile-d-olive"],
    isFeatured: true,
  },
  {
    slug: "tabel-du-cap-bon",
    name: "Tabel du Cap Bon",
    nameAr: "تابل الوطن القبلي",
    description:
      "Le mélange d'épices de base de la cuisine tunisienne : coriandre, carvi, ail et piment séchés puis moulus ensemble. Une cuillère suffit pour parfumer une sauce.",
    descriptionAr: "خليط التوابل الأساسي في المطبخ التونسي: كسبر وكروية وثوم وفلفل مجفّفة ومطحونة معًا. ملعقة واحدة تكفي لتعطير صلصة.",
    price: 4800,
    unit: "100 g",
    category: "epicerie-condiments",
    producer: "cooperative-nisaa-cap-bon",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["coriandre", "carvi", "ail", "piment"],
  },
  {
    slug: "piment-rouge-seche-moulu",
    name: "Piment rouge séché et moulu",
    nameAr: "فلفل أحمر مجفّف ومطحون",
    description:
      "Piment doux du Cap Bon séché au soleil puis moulu avec une goutte d'huile d'olive, comme dans les maisons de Nabeul. Il colore et parfume les sauces sans les brûler.",
    descriptionAr: "فلفل حلو من الوطن القبلي مجفّف تحت الشمس ثم مطحون بقطرة زيت زيتون، كما في بيوت نابل. يلوّن الصلصات ويعطّرها دون حرارة زائدة.",
    price: 6200,
    unit: "200 g",
    category: "epicerie-condiments",
    producer: "cooperative-nisaa-cap-bon",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["piment", "huile-d-olive", "sel"],
  },

  // ---------------------------------------------------------------------------
  // Pâtisserie Lilia — 100 % gluten-free pastry shop, Sahloul (Sousse)
  // ---------------------------------------------------------------------------
  {
    slug: "financiers-amandes",
    name: "Financiers aux amandes",
    nameAr: "فينانسيي باللوز",
    description:
      "Petits gâteaux moelleux à la poudre d'amande et au beurre noisette, à peine sucrés. Ils se gardent une semaine dans leur boîte.",
    descriptionAr: "كعك صغير طري بمسحوق اللوز والزبدة المحمّرة، قليل السكر. يُحفظ أسبوعًا في علبته.",
    price: 13500,
    unit: "Boîte de 6",
    category: "biscuits-gateaux",
    producer: "patisserie-lilia",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_PATISSERIE_LILIA,
    ingredients: ["amandes", "beurre", "oeufs", "sucre", "farine-de-riz"],
  },
  {
    slug: "sables-vanille",
    name: "Sablés à la vanille",
    nameAr: "بسكويت بالفانيليا",
    description:
      "Des sablés pur beurre à la farine de riz, friables et parfumés à la vanille de Madagascar. Le goûter préféré des enfants qui passent à la boutique.",
    descriptionAr: "بسكويت بالزبدة ودقيق الأرز، هشّ ومعطّر بفانيليا مدغشقر. اللمجة المفضلة لدى الأطفال الذين يزورون المحل.",
    price: 8900,
    unit: "250 g",
    category: "biscuits-gateaux",
    producer: "patisserie-lilia",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_PATISSERIE_LILIA,
    ingredients: ["farine-de-riz", "beurre", "sucre", "oeufs", "fecule-de-pomme-de-terre"],
  },
  {
    slug: "brownie-chocolat-noisettes",
    name: "Brownie chocolat et noisettes",
    nameAr: "براوني بالشوكولاتة والبندق",
    description:
      "Un brownie fondant au cacao intense et à la farine de sarrasin, parsemé de noisettes torréfiées. Vendu entier, prêt à couper en huit parts.",
    descriptionAr: "براوني طري بالكاكاو المركّز ودقيق الحنطة السوداء، مرشوش بالبندق المحمّص. يُباع كاملًا وجاهزًا للتقطيع إلى ثماني قطع.",
    price: 24000,
    unit: "La pièce (8 parts)",
    category: "biscuits-gateaux",
    producer: "patisserie-lilia",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_PATISSERIE_LILIA,
    ingredients: ["cacao", "sarrasin", "beurre", "oeufs", "sucre", "noisettes"],
    isFeatured: true,
  },
  {
    slug: "kaak-anis-sesame",
    name: "Kaak à l'anis et au sésame",
    nameAr: "كعك باليانسون والسمسم",
    description:
      "Les petites couronnes croquantes qu'on trempe dans le thé, revisitées à la farine de riz. Parfumées à l'anis vert et roulées dans le sésame.",
    descriptionAr: "الحلقات الصغيرة المقرمشة التي تُغمس في الشاي، بنسخة بدقيق الأرز. معطّرة باليانسون ومغطّاة بالسمسم.",
    price: 9500,
    unit: "300 g",
    category: "biscuits-gateaux",
    producer: "patisserie-lilia",
    guaranteeLevel: "CERTIFIED",
    certification: CERT_PATISSERIE_LILIA,
    ingredients: ["farine-de-riz", "mais", "anis-vert", "sesame", "huile-d-olive", "sucre"],
    addedDaysAgo: 20,
  },

  // ---------------------------------------------------------------------------
  // La Cuisine de Hela — home cook, Skanes (Monastir)
  // ---------------------------------------------------------------------------
  {
    slug: "couscous-sorgho-roule-main",
    name: "Couscous de sorgho roulé à la main",
    nameAr: "كسكسي بالدرع مفتول باليد",
    description:
      "Roulé, cuit à la vapeur puis séché au soleil de Monastir, ce couscous de sorgho a le goût rustique des couscous d'autrefois. Il se prépare exactement comme un couscous classique.",
    descriptionAr: "يُفتل ويُطهى على البخار ثم يُجفّف تحت شمس المنستير، لهذا الكسكسي بالدرع نكهة كسكسي زمان. يُحضَّر تمامًا مثل الكسكسي العادي.",
    price: 12500,
    unit: "1 kg",
    category: "couscous-pates",
    producer: "cuisine-de-hela",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["sorgho", "huile-d-olive", "sel"],
    isFeatured: true,
  },
  {
    slug: "mhamsa-de-mais",
    name: "Mhamsa de maïs",
    nameAr: "محمّصة بالذرة",
    description:
      "Gros grains de maïs roulés à la main, à cuire en soupe avec des légumes ou en sauce rouge à l'agneau. Un plat d'hiver réconfortant.",
    descriptionAr: "حبات ذرة كبيرة مفتولة باليد، تُطهى في الحساء مع الخضر أو في صلصة حمراء بلحم الخروف. طبق شتوي دافئ.",
    price: 9500,
    unit: "1 kg",
    category: "couscous-pates",
    producer: "cuisine-de-hela",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["mais", "huile-d-olive", "sel"],
  },
  {
    slug: "droo-de-sorgho",
    name: "Droô de sorgho",
    nameAr: "درع",
    description:
      "Farine de sorgho torréfiée, sucrée et relevée de sésame, à cuire dans du lait pour une crème épaisse. On la décore de fruits secs, comme le veut la tradition.",
    descriptionAr: "دقيق درع محمّص ومحلّى مع السمسم، يُطهى في الحليب لتحضير كريمة كثيفة. يُزيَّن بالفواكه الجافة كما تقتضي العادة.",
    price: 7800,
    unit: "500 g",
    category: "petit-dejeuner",
    producer: "cuisine-de-hela",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["sorgho", "sucre", "sesame"],
  },
  {
    slug: "bsissa-maison-sorgho",
    name: "Bsissa maison au sorgho",
    nameAr: "بسيسة منزلية بالدرع",
    description:
      "Sorgho, riz et pois chiches torréfiés puis moulus avec fenugrec, anis et cumin dans un moulin réservé au sans gluten. À délayer avec de l'huile d'olive et du miel.",
    descriptionAr: "درع وأرز وحمص محمّصة ثم مطحونة مع الحلبة واليانسون والكمون في مطحنة مخصّصة للمنتجات الخالية من الغلوتين. تُخلط بزيت الزيتون والعسل.",
    price: 9000,
    unit: "500 g",
    category: "petit-dejeuner",
    producer: "cuisine-de-hela",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["sorgho", "riz", "pois-chiches", "fenugrec", "anis-vert", "cumin"],
  },
  {
    slug: "briks-thon-surgelees",
    name: "Briks au thon surgelées",
    nameAr: "بريك بالتن مجمّد",
    description:
      "Six briks garnies de thon, de pomme de terre et de câpres, pliées dans des feuilles au riz puis surgelées. À frire directement, sans décongélation.",
    descriptionAr: "ست قطع بريك محشوة بالتن والبطاطا والكبّار، ملفوفة في أوراق بالأرز ثم مجمّدة. تُقلى مباشرة دون إذابة.",
    price: 12500,
    unit: "Boîte de 6",
    category: "plats-prepares",
    producer: "cuisine-de-hela",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["farine-de-riz", "fecule-de-pomme-de-terre", "thon", "pomme-de-terre", "huile-d-olive"],
    addedDaysAgo: 8,
  },

  // ---------------------------------------------------------------------------
  // Moulin El Ghaba — family olive mill, Sfax
  // ---------------------------------------------------------------------------
  {
    slug: "huile-olive-chemlali-1l",
    name: "Huile d'olive vierge extra Chemlali",
    nameAr: "زيت زيتون بكر ممتاز شملالي",
    description:
      "Pressée à froid moins de 24 heures après la récolte, cette huile douce aux notes d'amande verte accompagne aussi bien la bsissa que les salades.",
    descriptionAr: "معصورة على البارد في أقل من 24 ساعة بعد الجني، هذا الزيت اللطيف بنكهة اللوز الأخضر يرافق البسيسة والسلطات على حد سواء.",
    price: 22000,
    unit: "1 L",
    category: "epicerie-condiments",
    producer: "moulin-el-ghaba",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["huile-d-olive"],
    isFeatured: true,
  },
  {
    slug: "huile-olive-bidon-3l",
    name: "Huile d'olive vierge extra — bidon de 3 L",
    nameAr: "زيت زيتون بكر ممتاز — عبوة 3 لتر",
    description: "La même huile Chemlali en bidon familial, pour la cuisine de tous les jours. À conserver à l'abri de la lumière.",
    descriptionAr: "نفس زيت الشملالي في عبوة عائلية للطبخ اليومي. يُحفظ بعيدًا عن الضوء.",
    price: 45000,
    unit: "Bidon de 3 L",
    category: "epicerie-condiments",
    producer: "moulin-el-ghaba",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["huile-d-olive"],
  },

  // ---------------------------------------------------------------------------
  // Atelier Sabra — makroudh workshop, Kairouan (shared workshop: traces risk)
  // ---------------------------------------------------------------------------
  {
    slug: "makroudh-kairouan-mais",
    name: "Makroudh de Kairouan au maïs",
    nameAr: "مقروض القيروان بالذرة",
    description:
      "Le makroudh de la médina, préparé à la semoule de maïs avec une généreuse pâte de dattes, puis trempé dans le miel. Fabriqué dans un atelier qui travaille aussi le blé.",
    descriptionAr: "مقروض المدينة العتيقة محضّر بسميد الذرة وعجينة تمر سخية، ثم مغموس في العسل. يُصنع في ورشة تستعمل القمح أيضًا.",
    price: 16000,
    unit: "500 g",
    category: "patisserie-tunisienne",
    producer: "atelier-sabra-kairouan",
    guaranteeLevel: "TRACES_RISK",
    mayContain: "blé (atelier qui prépare aussi le makroudh traditionnel)",
    ingredients: ["mais", "dattes", "huile-d-olive", "miel", "eau-de-fleur-d-oranger"],
  },
  {
    slug: "ghraiba-droo",
    name: "Ghraiba au sorgho (ghraiba droô)",
    nameAr: "غريبة الدرع",
    description:
      "Biscuits sablés à la farine de sorgho, typiques du centre du pays, à la texture friable et au goût de céréale grillée. Parfaits avec un thé à la menthe.",
    descriptionAr: "غريبة بدقيق الدرع، معروفة في وسط البلاد، هشّة القوام وبنكهة الحبوب المحمّصة. مثالية مع شاي بالنعناع.",
    price: 12000,
    unit: "400 g",
    category: "patisserie-tunisienne",
    producer: "atelier-sabra-kairouan",
    guaranteeLevel: "TRACES_RISK",
    mayContain: "blé (atelier non dédié)",
    ingredients: ["sorgho", "sucre", "beurre"],
  },

  // ---------------------------------------------------------------------------
  // Dar El Bharat — spice shop, Houmt Souk (Djerba)
  // ---------------------------------------------------------------------------
  {
    slug: "epices-riz-djerbien",
    name: "Mélange d'épices pour riz djerbien",
    nameAr: "خليط توابل الرز الجربي",
    description:
      "Le mélange de la maison pour réussir le riz djerbien cuit à la vapeur : cumin, coriandre, carvi, piment et menthe séchée. Dosé pour un kilo de riz.",
    descriptionAr: "خليط الدكان لإنجاح الرز الجربي المطهو على البخار: كمون وكسبر وكروية وفلفل ونعناع مجفّف. بمقدار يكفي كيلوغرامًا من الأرز.",
    price: 5500,
    unit: "100 g",
    category: "epicerie-condiments",
    producer: "dar-el-bharat-djerba",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["cumin", "coriandre", "carvi", "piment", "menthe"],
  },
  {
    slug: "mloukhia-moulue",
    name: "Mloukhia moulue",
    nameAr: "ملوخية مطحونة",
    description:
      "Feuilles de corète séchées à l'ombre puis finement moulues, pour une mloukhia bien noire et parfumée. Rien d'autre dans le sachet.",
    descriptionAr: "أوراق ملوخية مجفّفة في الظل ثم مطحونة ناعمًا، لملوخية سوداء وعطرة. لا شيء آخر في الكيس.",
    price: 9000,
    unit: "250 g",
    category: "epicerie-condiments",
    producer: "dar-el-bharat-djerba",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["corete"],
  },

  // ---------------------------------------------------------------------------
  // Coopérative Oasis Nakhla — date growers, Tozeur
  // ---------------------------------------------------------------------------
  {
    slug: "dattes-deglet-nour",
    name: "Dattes Deglet Nour en branches",
    nameAr: "دقلة النور بعراجينها",
    description:
      "Les « doigts de lumière » de Tozeur, translucides et mielleux, présentés sur leurs branches. Récolte de l'année, triée une à une.",
    descriptionAr: "«أصابع النور» من توزر، شفافة وعسلية، معروضة على عراجينها. من جني هذا العام ومفروزة حبة حبة.",
    price: 14500,
    unit: "Boîte de 1 kg",
    category: "dattes",
    producer: "cooperative-oasis-nakhla",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["dattes"],
    isFeatured: true,
  },
  {
    slug: "pate-de-dattes-ajina",
    name: "Pâte de dattes (aâjina)",
    nameAr: "عجينة التمر",
    description:
      "Pâte de dattes pure, sans sucre ajouté, pour garnir makroudh, ghraiba et kaak. Elle se travaille facilement à la main.",
    descriptionAr: "عجينة تمر خالصة دون سكر مضاف، لحشو المقروض والغريبة والكعك. تُعجن بسهولة باليد.",
    price: 5500,
    unit: "500 g",
    category: "dattes",
    producer: "cooperative-oasis-nakhla",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["dattes"],
  },
  {
    slug: "dattes-fourrees-amandes",
    name: "Dattes fourrées à la pâte d'amande",
    nameAr: "تمر محشي بعجينة اللوز",
    description:
      "Deglet Nour dénoyautées et garnies d'une pâte d'amande parfumée à la fleur d'oranger. Le plateau des grandes occasions.",
    descriptionAr: "دقلة نور منزوعة النوى ومحشوة بعجينة لوز معطّرة بماء الزهر. صينية المناسبات الكبرى.",
    price: 19500,
    unit: "Boîte de 500 g",
    category: "dattes",
    producer: "cooperative-oasis-nakhla",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["dattes", "amandes", "sucre", "eau-de-fleur-d-oranger"],
  },
  {
    slug: "sirop-de-dattes-rob",
    name: "Sirop de dattes (rob)",
    nameAr: "رُبّ التمر",
    description:
      "Le rob traditionnel, obtenu en cuisant lentement les dattes : un sirop épais qui remplace le sucre dans l'assida ou sur les crêpes. De retour après la nouvelle récolte.",
    descriptionAr: "الرُّب التقليدي المستخرج بطهي التمر ببطء: شراب كثيف يعوّض السكر في العصيدة أو على الكريب. يعود بعد الجني الجديد.",
    price: 9000,
    unit: "500 g",
    category: "dattes",
    producer: "cooperative-oasis-nakhla",
    guaranteeLevel: "NATURALLY_GF",
    ingredients: ["dattes"],
    isAvailable: false, // back after the new harvest
  },

  // ---------------------------------------------------------------------------
  // Épicerie du Vieux Port — Bizerte (inactive producer, so this product is inactive too)
  // ---------------------------------------------------------------------------
  {
    slug: "barres-dattes-cacahuetes",
    name: "Barres aux dattes et aux cacahuètes",
    nameAr: "أصابع التمر والفول السوداني",
    description:
      "Barres moelleuses aux dattes, riz soufflé et cacahuètes grillées, liées au miel. Préparées sur le comptoir de l'épicerie, à côté d'autres produits.",
    descriptionAr: "أصابع طرية بالتمر والأرز المنفوخ والفول السوداني المحمّص، مربوطة بالعسل. تُحضَّر على طاولة البقالة بجانب منتجات أخرى.",
    price: 7500,
    unit: "Boîte de 6",
    category: "snacks-aperitifs",
    producer: "epicerie-du-vieux-port",
    guaranteeLevel: "TRACES_RISK",
    mayContain: "gluten",
    ingredients: ["dattes", "riz", "arachides", "miel", "sesame"],
    isActive: false,
  },
];
