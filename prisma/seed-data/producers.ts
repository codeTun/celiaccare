/**
 * Gluten-free businesses ("artisans") shown on the site: REAL Tunisian businesses, researched
 * on public sources on 2026-11-21. CeliacCare lists only 100 % gluten-free businesses.
 *
 * Rules for this file (the site is public and these are real businesses):
 * - Only facts published by the business itself or by a reliable source (official website,
 *   official social pages, the ATMC celiac association, the press). `verificationSource` says where.
 * - Phone numbers, e-mails and opening hours only when the business publishes them; null otherwise.
 * - Nobody here holds an official gluten-free certificate: the guarantee level is DEDICATED
 *   ("100 % sans gluten", dedicated workshop). Never mark a real business CERTIFIED without proof.
 * - `trainedStaff` stays false unless a source says so.
 * - GPS points are approximate (shop when known, otherwise the town or neighbourhood).
 * - `joinedMonthsAgo` (when the business "joined" the platform) is demo data: these businesses
 *   are NOT partners of CeliacCare (the site shows a demo notice).
 * - `governorate` must be one of the 24 values of lib/tunisia.ts.
 */
import type { Governorate } from "../../lib/tunisia";
import type { GuaranteeLevel, ProducerType } from "../../types/enums";

export type SeedProducer = {
  slug: string;
  name: string;
  type: ProducerType;
  description: string;
  descriptionAr: string;
  city: string;
  governorate: Governorate;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  openingHours: string | null;
  guaranteeLevel: GuaranteeLevel;
  dedicatedSpace: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  verificationSource: string;
  verifiedMonthsAgo: number;
  joinedMonthsAgo: number;
  isActive: boolean;
};

/** The ATMC (Association Tunisienne de la Maladie Cœliaque) guide that lists the gluten-free brands allowed in Tunisia. */
const ATMC_GUIDE = "Guide du régime sans gluten de l'ATMC 2023 (marque autorisée)";

export const PRODUCERS: SeedProducer[] = [
  {
    slug: "glutella",
    name: "Glutella",
    type: "MANUFACTURER",
    description:
      "Entreprise tunisienne fondée en 2022 par une mère d'enfant intolérant au gluten, qui a commencé par des gâteaux faits maison pour des enfants cœliaques. Elle fabrique des farines (sorgho, sarrasin, pois chiche), des pâtes traditionnelles (couscous, nouasser) et des biscuits tunisiens sans gluten. Lauréate du prix CDC Agribusiness (Femmes entrepreneures de Tunisie, 2026).",
    descriptionAr:
      "شركة تونسية تأسست سنة 2022 على يد أمّ لطفل لا يتحمّل الغلوتين، بدأت بحلويات منزلية للأطفال المصابين بالسيلياك. تصنع دقيقًا (درع، حنطة سوداء، حمّص) وعجائن تقليدية (كسكسي، نواصر) وبسكويتًا تونسيًا خاليًا من الغلوتين. تحصّلت على جائزة CDC للفلاحة الغذائية (نساء رائدات أعمال في تونس، 2026).",
    city: "Mohamedia",
    governorate: "Ben Arous",
    address: "Rue de l'Environnement, Mohamedia 1145",
    latitude: 36.676,
    longitude: 10.157,
    phone: "27242246",
    whatsapp: null,
    email: "contact@glutella.tn",
    website: "https://www.glutella.tn/",
    instagram: null,
    facebook: "https://www.facebook.com/Glutella.tunisie/",
    openingHours: "Lun – Ven · 9h – 17h · Sam · 9h – 13h",
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: `Site officiel glutella.tn · ${ATMC_GUIDE} · prix publics relevés sur tunisiebio.tn (nov. 2026)`,
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 9,
    isActive: true,
  },
  {
    slug: "ibn-hayyan",
    name: "Ibn Hayyan",
    type: "MANUFACTURER",
    description:
      "Société tunisienne créée par un médecin et un pharmacien industriel, qui fabrique à Msaken des produits diététiques sans gluten et sans lactose : couscous, mhamsa, pâtes et préparations pour pain et pizza. Elle indique produire sur des chaînes spécifiques pour éviter toute contamination croisée, selon les directives du Codex Alimentarius et la méthode HACCP.",
    descriptionAr:
      "شركة تونسية أسّسها طبيب وصيدلي صناعي، تصنع في مساكن منتجات حمية خالية من الغلوتين ومن اللاكتوز: كسكسي، محمّص، عجائن وخلطات للخبز والبيتزا. تؤكّد أنها تنتج على خطوط مخصّصة لتفادي أي تلوّث متقاطع، وفق توجيهات الدستور الغذائي (Codex Alimentarius) ومنهجية HACCP.",
    city: "Msaken",
    governorate: "Sousse",
    address: "Avenue Taieb Hachicha (GP1), immeuble Kifeji, 3e étage, Msaken 4070",
    latitude: 35.729,
    longitude: 10.58,
    phone: "20010011",
    whatsapp: null,
    email: "contact@ibnhayyan.tn",
    website: "https://ibnhayyan.tn/",
    instagram: "https://www.instagram.com/ibnhayyan.tn/",
    facebook: "https://www.facebook.com/ibnhayyan.tn",
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: `Site officiel ibnhayyan.tn (chaînes de production dédiées) · ${ATMC_GUIDE}`,
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 12,
    isActive: true,
  },
  {
    slug: "lorizo",
    name: "Lorizo",
    type: "MANUFACTURER",
    description:
      "Fabricant sfaxien spécialisé dans l'alimentation sans gluten à base de riz et de maïs : farines, couscous, masfouf et biscuits.",
    descriptionAr:
      "مصنع صفاقسي مختص في الأغذية الخالية من الغلوتين المصنوعة من الأرز والذرة: دقيق، كسكسي، مسفوف وبسكويت.",
    city: "Sfax (Merkez Sebei)",
    governorate: "Sfax",
    address: "Route de Mahdia km 9, Merkez Sebei, Sfax",
    latitude: 34.7406,
    longitude: 10.7603,
    phone: "58727072",
    whatsapp: null,
    email: null,
    website: null,
    instagram: null,
    facebook: "https://www.facebook.com/Lorizo.sansgluten",
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: `${ATMC_GUIDE} · prix publics relevés sur tunisiebio.tn et glutenfree.tn (nov. 2026)`,
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 7,
    isActive: true,
  },
  {
    slug: "ecopasta",
    name: "Ecopasta",
    type: "MANUFACTURER",
    description:
      "Petite société tunisienne qui produit des pâtes, du couscous et des farines 100 % maïs et riz, sans gluten.",
    descriptionAr:
      "شركة تونسية صغيرة تنتج عجائن وكسكسي ودقيقًا من الذرة والأرز بنسبة 100٪، خالية من الغلوتين.",
    city: "El Manar 2",
    governorate: "Tunis",
    address: "45, avenue Youssef Rouissi, El Manar 2, 2092 Tunis",
    latitude: 36.83805,
    longitude: 10.15576,
    phone: null,
    whatsapp: null,
    email: null,
    website: null,
    instagram: null,
    facebook: null,
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: `${ATMC_GUIDE} · prix publics relevés sur tyfano.tn (nov. 2026)`,
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 5,
    isActive: true,
  },
  {
    slug: "la-seine",
    name: "La Seine",
    type: "BAKERY",
    description:
      "Pâtisserie diététique fondée en 2015, spécialisée dans les douceurs sans gluten, sans sucre, keto et vegan. Ses produits sans gluten sont fabriqués dans une unité de production physiquement séparée et entièrement dédiée ; les autres produits de la maison sont préparés dans la seconde unité. Élue meilleure pâtisserie sans gluten en 2018 et 2019 par la Gluten Free Academy. Boutiques à El Menzah 6 et à La Marsa.",
    descriptionAr:
      "حلويات حمية تأسست سنة 2015، مختصة في الحلويات الخالية من الغلوتين ومن السكر وكيتو والنباتية. تُصنع منتجاتها الخالية من الغلوتين في وحدة إنتاج منفصلة ماديًا ومخصّصة لها بالكامل، فيما تُحضَّر منتجات المحل الأخرى في الوحدة الثانية. اختيرت أفضل محل حلويات خالية من الغلوتين سنتي 2018 و2019 من قبل Gluten Free Academy. لها محلّان في المنزه السادس والمرسى.",
    city: "El Menzah 6",
    governorate: "Ariana",
    address: "2, rue Taher Memmi, El Menzah 6 · 2e boutique : Résidence Hannibal, rue Abdelhafidh El Mekki, La Marsa",
    latitude: 36.849,
    longitude: 10.168,
    phone: "56836630",
    whatsapp: null,
    email: "contact.laseine@gmail.com",
    website: "https://laseine.tn/",
    instagram: "https://www.instagram.com/laseine.tn/",
    facebook: "https://www.facebook.com/laseine.tn",
    openingHours: "Tous les jours · 8h30 – 20h (boutique de La Marsa)",
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource:
      "Site officiel laseine.tn · Managers.tn, 19/10/2026 (unité de production dédiée au sans gluten) · prix publics relevés sur Glovo (nov. 2026)",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 14,
    isActive: true,
  },
  {
    slug: "lilydelights",
    name: "LilyDelights",
    type: "BAKERY",
    description:
      "Pâtisserie diététique de Hammamet entièrement sans gluten, qui propose aussi des options sans sucre et keto. Elle prépare du sucré (brioches, gaufres, gâteaux) et du salé (pains, buns, mini-pizzas, sandwichs). Ses prix ne sont pas encore publiés sur CeliacCare.",
    descriptionAr:
      "حلويات حمية في الحمامات خالية تمامًا من الغلوتين، تقدّم أيضًا خيارات دون سكر وكيتو. تحضّر الحلو (بريوش، وافل، كعك) والمالح (خبز، بانز، بيتزا صغيرة، سندويتشات). أسعارها غير منشورة على CeliacCare بعد.",
    city: "Hammamet",
    governorate: "Nabeul",
    address: "Rue Dag Hammarskjöld, Hammamet 8050",
    latitude: 36.4,
    longitude: 10.616,
    phone: "54291103",
    whatsapp: null,
    email: null,
    website: null,
    instagram: "https://www.instagram.com/lily.delights.tunisia/",
    facebook: "https://www.facebook.com/LilyDelights.tn/",
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Pages officielles Instagram et Facebook (« 100 % sans gluten ») · fiche Atly « 100% Dedicated Gluten-Free »",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 4,
    isActive: true,
  },
  {
    slug: "atmc-boulangerie-le-kram",
    name: "Boulangerie sans gluten de l'ATMC – Le Kram",
    type: "BAKERY",
    description:
      "Boulangerie 100 % sans gluten de l'Association Tunisienne de la Maladie Cœliaque (ATMC). Elle produit du pain et des gâteaux secs (kaak) sans gluten, sur commande préalable.",
    descriptionAr:
      "مخبزة خالية تمامًا من الغلوتين تابعة للجمعية التونسية لمرض السيلياك. تنتج الخبز والكعك الخالي من الغلوتين بالطلب المسبق.",
    city: "Le Kram",
    governorate: "Tunis",
    address: "Rue du Jardin, Kram Ouest",
    latitude: 36.836,
    longitude: 10.296,
    phone: "58144554",
    whatsapp: null,
    email: null,
    website: "http://www.atmc.tn/fr/nos-activites/",
    instagram: null,
    facebook: null,
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Site officiel de l'ATMC (atmc.tn) : « 2 boulangeries 100 % sans gluten » · La Presse, 23/05/2026",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 10,
    isActive: true,
  },
  {
    slug: "atmc-boulangerie-djerba",
    name: "Boulangerie sans gluten de l'ATMC – Djerba",
    type: "BAKERY",
    description:
      "Première boulangerie spécialisée sans gluten du sud tunisien, ouverte en avril 2017 à Houmt Souk à l'initiative de l'ATMC. Elle produit du pain et des gâteaux secs 100 % sans gluten, préparés sur commande.",
    descriptionAr:
      "أول مخبزة مختصة في المنتجات الخالية من الغلوتين في الجنوب التونسي، فُتحت في أفريل 2017 بحومة السوق بمبادرة من الجمعية التونسية لمرض السيلياك. تنتج خبزًا وكعكًا خاليًا تمامًا من الغلوتين، ويُحضَّر حسب الطلب.",
    city: "Houmt Souk (Djerba)",
    governorate: "Médenine",
    address: "Avenue Habib Bourguiba, Houmt Souk",
    latitude: 33.875,
    longitude: 10.857,
    phone: "98254255",
    whatsapp: null,
    email: null,
    website: "http://www.atmc.tn/fr/nos-activites/",
    instagram: null,
    facebook: null,
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Site officiel de l'ATMC (atmc.tn) : « 2 boulangeries 100 % sans gluten » · La Presse, 23/05/2026",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 10,
    isActive: true,
  },
  {
    slug: "glucelia",
    name: "Glucélia",
    type: "MANUFACTURER",
    description:
      "Jeune marque tunisienne de préparations 100 % sans gluten (mix de farines) pour réussir à la maison les classiques tunisiens (fricassé, brik danouni, bambalouni, batbout) et les goûters (crêpes, pancakes, muffins, génoise). Elle garantit tous ses produits sans gluten, indique les manipuler dans un environnement contrôlé contre la contamination croisée et annonce une certification de l'Institut national de nutrition, sans publier de certificat.",
    descriptionAr:
      "علامة تونسية ناشئة لخلطات دقيق خالية تمامًا من الغلوتين، لتحضير الأكلات التونسية الكلاسيكية في البيت (فريكاسي، بريك دنوني، بمبالوني، بطبوط) وحلويات اللمجة (كريب، بانكيك، مافن، جينواز). تضمن أن كل منتجاتها خالية من الغلوتين، وتؤكّد أنها تُحضَّر وتُداوَل في محيط مراقَب لتفادي التلوّث المتقاطع، وتعلن عن شهادة من المعهد الوطني للتغذية دون أن تنشرها.",
    city: "La Marsa",
    governorate: "Tunis",
    address: "Imm. Ennasim, Z.I. Sidi Daoud, La Marsa, Tunis 2046",
    latitude: 36.876,
    longitude: 10.325,
    phone: "57033680",
    whatsapp: null,
    email: "contact@glucelia.tn",
    website: "https://glucelia.tn",
    instagram: "https://www.instagram.com/gluceliasansgluten/",
    facebook: "https://www.facebook.com/gluceliasansgluten",
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    // Not published: where the mixes are made, or whether that site also handles wheat ("Non déclaré" on the sheet).
    dedicatedSpace: false,
    dedicatedUtensils: false,
    trainedStaff: false,
    verificationSource:
      "Site officiel glucelia.tn (« 100% gluten-free », FAQ sur la contamination croisée, CGV) · Instagram et Facebook officiels · prix publics du site (nov. 2026)",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 3,
    isActive: true,
  },
  {
    slug: "gluten-free-serenity",
    name: "Gluten Free Serenity",
    type: "SPECIALTY_SHOP",
    description:
      "Petite boutique familiale d'Ezzahra spécialisée dans le sans gluten, décrite dans un avis client comme entièrement sans gluten. Elle vend des produits d'épicerie sans gluten (pâtes, couscous, farines, galettes de riz, biscuits) et, d'après les avis, du pain, des pizzas, des crêpes et des pancakes sans gluten à emporter. Revendeur officiel des mix Glucélia ; ses prix ne sont pas publiés en ligne.",
    descriptionAr:
      "محل عائلي صغير في الزهراء مختص في المنتجات الخالية من الغلوتين، وصفه أحد الزبائن في تقييمه بأنه خالٍ تمامًا من الغلوتين. يبيع مواد غذائية خالية من الغلوتين (عجين، كسكسي، دقيق، كعك الأرز، بسكويت)، وحسب آراء الزبائن خبزًا وبيتزا وكريب وبانكيك خالية من الغلوتين للأخذ. نقطة بيع معتمدة لخلطات Glucélia، وأسعاره غير منشورة على الإنترنت.",
    city: "Ezzahra",
    governorate: "Ben Arous",
    address: "17 rue Hassen Ibn Noôman, Ez Zahra, Ben Arous",
    latitude: 36.7474218,
    longitude: 10.3055539,
    phone: null,
    whatsapp: null,
    email: null,
    website: null,
    instagram: null,
    facebook: null,
    openingHours: "Lun – Sam · 9h – 18h · fermé le dimanche (horaires Google, à confirmer)",
    guaranteeLevel: "DEDICATED",
    // Only a customer review says the shop is entirely gluten-free; the business declares no practice.
    dedicatedSpace: false,
    dedicatedUtensils: false,
    trainedStaff: false,
    verificationSource:
      "Fiche Google reprise par Restaurant Guru (catégorie « Gluten-free », avis « A totally gluten free shop », mise à jour le 03/07/2026) · liste des revendeurs officiels de Glucélia (glucelia.tn)",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 6,
    // Hidden until confirmed: its "100 % sans gluten" status rests on a single customer review.
    // Confirm by phone, then activate it in the admin (Artisans).
    isActive: false,
  },
  {
    slug: "emely-tresor-oasien",
    name: "EMELY (Trés'OR Oasien)",
    type: "HOME_SELLER",
    description:
      "Petite entreprise familiale de Rjim Maatoug (Kébili) qui récolte et transforme ses propres dattes Deglet Nour : pâtes à tartiner (datte-cacahuète, datte-sésame, datte-noisette, zrir), confiture, sirop, jus, vinaigre, poudre de dattes et café de noyaux. Toute la gamme est à base de dattes, de sésame et de fruits secs (arachide, noisette), sans aucune céréale, et deux pâtes à tartiner portent la mention « sans gluten ». Le lieu de broyage des poudres (dattes, noyaux) n'est pas précisé.",
    descriptionAr:
      "مؤسسة عائلية صغيرة في رجيم معتوق (قبلي) تجني تمور دقلة النور من نخيلها وتحوّلها بنفسها: كريمات للدهن (تمر وفول سوداني، تمر وسمسم، تمر وبندق، زرير)، معجون، رُبّ، عصير، خلّ، مسحوق التمر وقهوة نوى التمر. كل منتجاتها مصنوعة من التمر والسمسم والفواكه الجافة (فول سوداني، بندق) دون أي حبوب، وتحمل كريمتان للدهن عبارة « خالٍ من الغلوتين ». ولا يُذكر مكان طحن المساحيق (التمر والنوى).",
    city: "Rjim Maatoug (El Ferdaous)",
    governorate: "Kébili",
    address: "El Ferdaous, Rjim Maatoug 4210",
    latitude: 33.319,
    longitude: 7.947,
    phone: null,
    whatsapp: null,
    email: null,
    website: "https://ileycom.com/store/emely",
    instagram: null,
    facebook: null,
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    // Naturally gluten-free range; no workshop or utensil practice published (a shared mill is not ruled out).
    dedicatedSpace: false,
    dedicatedUtensils: false,
    trainedStaff: false,
    verificationSource:
      "Fiche du producteur en ligne (compositions, mentions « sans gluten » et prix publics relevés en nov. 2026)",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 5,
    isActive: true,
  },
  {
    slug: "miellogene",
    name: "Miellogène",
    type: "MANUFACTURER",
    description:
      "Petite marque tunisienne de miel brut basée à La Marsa : miel d'eucalyptus de la région de Sejnan et miel de coriandre du Cap Bon, vendus non pasteurisés, non chauffés et non filtrés, en pots de 240 g et 480 g. Sa gamme ne contient que du miel, naturellement sans gluten ; la marque n'affiche ni mention ni certification « sans gluten ».",
    descriptionAr:
      "علامة تونسية صغيرة للعسل الخام مقرّها المرسى: عسل الأوكالبتوس من جهة سجنان وعسل الكسبر من الوطن القبلي، عسل غير مبستر وغير مسخّن وغير مصفّى، في أوعية بوزن 240 غ و480 غ. لا تضمّ تشكيلتها سوى العسل، وهو خالٍ من الغلوتين بطبيعته، ولا تحمل العلامة أي عبارة أو شهادة « خالٍ من الغلوتين ».",
    city: "La Marsa",
    governorate: "Tunis",
    address: "La Marsa Plage, Tunis 2078",
    latitude: 36.878,
    longitude: 10.325,
    phone: null,
    whatsapp: null,
    email: null,
    website: null,
    instagram: "https://www.instagram.com/miellogene.tunisia/",
    facebook: "https://www.facebook.com/profile.php?id=61565339042927",
    openingHours: null,
    guaranteeLevel: "DEDICATED",
    // Honey only (naturally gluten-free); the brand publishes no workshop or utensil practice.
    dedicatedSpace: false,
    dedicatedUtensils: false,
    trainedStaff: false,
    verificationSource:
      "Fiche de la marque en ligne (prix promotionnels relevés en nov. 2026) · Instagram et Facebook officiels de la marque",
    verifiedMonthsAgo: 0,
    joinedMonthsAgo: 4,
    isActive: true,
  },
];
