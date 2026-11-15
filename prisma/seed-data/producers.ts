/**
 * Small businesses ("artisans") whose products are sold on the site (demo data).
 * Every business, person, address and phone number below is FICTIONAL.
 *
 * - `slug` is the unique key (products refer to their producer by slug).
 * - `governorate` must be one of the 24 values of lib/tunisia.ts.
 * - Phones: 8 digits, no spaces. E-mails use the reserved example.com domain.
 * - Home sellers: the GPS point is the neighbourhood, never the exact house.
 * - `verifiedMonthsAgo`: date of the last check of the sheet, counted back from the day
 *   the seed runs. More than 12 months => the site shows "à revérifier" (spec 6.1).
 * - `joinedMonthsAgo`: when the business joined the platform (creation date of the sheet).
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
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  openingHours: string;
  guaranteeLevel: GuaranteeLevel;
  dedicatedSpace: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  verificationSource: string;
  verifiedMonthsAgo: number;
  joinedMonthsAgo: number;
  isActive: boolean;
};

export const PRODUCERS: SeedProducer[] = [
  {
    slug: "fournil-yasmine",
    name: "Fournil Yasmine",
    type: "BAKERY",
    description:
      "Boulangerie 100 % sans gluten ouverte par Yasmine, pâtissière de métier et elle-même cœliaque. Aucune farine de blé n'entre dans le fournil : pains, viennoiseries et pizzas sont pétris chaque matin avec du riz, du sarrasin et du sorgho.",
    descriptionAr:
      "مخبزة خالية تمامًا من الغلوتين أسستها ياسمين، الحلوانية المصابة هي نفسها بالسيلياك. لا يدخل المخبز أي دقيق قمح: الخبز والمعجنات والبيتزا تُعجن كل صباح بالأرز والحنطة السوداء والدرع.",
    city: "La Marsa",
    governorate: "Tunis",
    address: "18, rue Ibn Khaldoun, La Marsa",
    latitude: 36.8784,
    longitude: 10.3241,
    phone: "71742318",
    whatsapp: "98214563",
    email: "fournil.yasmine@example.com",
    openingHours: "Mar – Dim · 7h – 19h",
    guaranteeLevel: "CERTIFIED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: true,
    verificationSource: "Visite sur place et certificat fourni",
    verifiedMonthsAgo: 2.1,
    joinedMonthsAgo: 11,
    isActive: true,
  },
  {
    slug: "epi-libre",
    name: "Épi Libre",
    type: "SPECIALTY_SHOP",
    description:
      "Épicerie fine spécialisée dans le sans gluten, avec un petit atelier séparé où sont moulues les farines et préparés granola, crackers et pâtes de riz. L'équipe connaît chaque fournisseur et prend le temps de conseiller les familles qui débutent le régime.",
    descriptionAr:
      "بقالة مختصة في المنتجات الخالية من الغلوتين، بها ورشة صغيرة منفصلة تُطحن فيها الدقائق ويُحضَّر الغرانولا والبسكويت المالح ومعكرونة الأرز. يعرف الفريق كل مزوّد ويخصّص الوقت لنصح العائلات التي تبدأ الحمية.",
    city: "Mutuelleville",
    governorate: "Tunis",
    address: "22, avenue Jugurtha, Mutuelleville, Tunis",
    latitude: 36.8231,
    longitude: 10.1722,
    phone: "71803457",
    whatsapp: "22618904",
    email: "bonjour.epilibre@example.com",
    openingHours: "Lun – Sam · 9h – 19h30",
    guaranteeLevel: "CERTIFIED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: true,
    verificationSource: "Visite sur place et certificat fourni",
    verifiedMonthsAgo: 3.2,
    joinedMonthsAgo: 10,
    isActive: true,
  },
  {
    slug: "douceurs-de-mounira",
    name: "Les Douceurs de Mounira",
    type: "HOME_SELLER",
    description:
      "Mounira prépare à la maison les gâteaux tunisiens de toujours depuis que sa fille a été diagnostiquée cœliaque. Sa cuisine est devenue entièrement sans gluten : ghraiba, makroudh et kaak warka sont faits sur commande, en petites quantités.",
    descriptionAr:
      "تحضّر منيرة في بيتها الحلويات التونسية الأصيلة منذ أن شُخّصت ابنتها بالسيلياك. أصبح مطبخها خاليًا تمامًا من الغلوتين: الغريبة والمقروض وكعك الورقة تُحضَّر حسب الطلب وبكميات صغيرة.",
    city: "Ennasr",
    governorate: "Ariana",
    address: "Ennasr 2 — retrait sur rendez-vous",
    latitude: 36.8602,
    longitude: 10.1588,
    phone: "52417836",
    whatsapp: "52417836",
    email: null,
    openingHours: "Sur commande · livraison le mardi et le vendredi",
    guaranteeLevel: "NATURALLY_GF",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Visite sur place",
    verifiedMonthsAgo: 4.3,
    joinedMonthsAgo: 8,
    isActive: true,
  },
  {
    slug: "superette-el-amen",
    name: "Supérette El Amen",
    type: "GROCERY",
    description:
      "Épicerie de quartier qui a ouvert un rayon sans gluten à la demande de ses clients. La bsissa et les pois chiches grillés sont préparés sur place, sur un moulin partagé avec des produits au blé : les fiches le signalent clairement.",
    descriptionAr:
      "بقالة حيّ فتحت ركنًا للمنتجات الخالية من الغلوتين بطلب من حرفائها. تُحضَّر البسيسة والحمص المحمّص في المحل على مطحنة مشتركة مع منتجات القمح، وهو ما توضّحه البطاقات بوضوح.",
    city: "El Mourouj",
    governorate: "Ben Arous",
    address: "12, avenue de la République, El Mourouj 3",
    latitude: 36.7298,
    longitude: 10.2141,
    phone: "79361205",
    whatsapp: null,
    email: null,
    openingHours: "Tous les jours · 7h – 22h",
    guaranteeLevel: "TRACES_RISK",
    dedicatedSpace: false,
    dedicatedUtensils: false,
    trainedStaff: false,
    verificationSource: "Appel téléphonique",
    verifiedMonthsAgo: 14.2, // older than 12 months: shown as "à revérifier"
    joinedMonthsAgo: 15,
    isActive: true,
  },
  {
    slug: "cooperative-nisaa-cap-bon",
    name: "Coopérative Nisaa Cap Bon",
    type: "COOPERATIVE",
    description:
      "Une trentaine d'agricultrices de Korba sèchent au soleil les piments de leurs champs et préparent la harissa à l'ancienne, pilée avec l'ail, le carvi et la coriandre. Aucune farine ni aucun épaississant n'est ajouté.",
    descriptionAr:
      "حوالي ثلاثين فلاحة من قربة يجفّفن فلفل حقولهن تحت الشمس ويحضّرن الهريسة على الطريقة القديمة، مدقوقة بالثوم والكروية والكسبر. لا يُضاف أي دقيق أو مكثّف.",
    city: "Korba",
    governorate: "Nabeul",
    address: "Route de Menzel Temime, Korba",
    latitude: 36.5791,
    longitude: 10.8602,
    phone: "72384119",
    whatsapp: "97532640",
    email: "nisaa.capbon@example.com",
    openingHours: "Lun – Sam · 8h – 16h",
    guaranteeLevel: "NATURALLY_GF",
    dedicatedSpace: false,
    dedicatedUtensils: true,
    trainedStaff: true,
    verificationSource: "Visite sur place",
    verifiedMonthsAgo: 3,
    joinedMonthsAgo: 9,
    isActive: true,
  },
  {
    slug: "patisserie-lilia",
    name: "Pâtisserie Lilia",
    type: "BAKERY",
    description:
      "Pâtisserie fine 100 % sans gluten tenue par Lilia et son frère Amine. Financiers, sablés et brownies sont préparés dans un laboratoire dédié avec des farines contrôlées, et les recettes sont affichées en boutique.",
    descriptionAr:
      "محل مرطبات راقٍ خالٍ تمامًا من الغلوتين تديره ليليا وأخوها أمين. تُحضَّر الفينانسيي والبسكويت والبراوني في مخبر مخصّص بدقائق مراقبة، والوصفات معلّقة في المحل.",
    city: "Sahloul",
    governorate: "Sousse",
    address: "Boulevard du 14 Janvier, Sahloul, Sousse",
    latitude: 35.8357,
    longitude: 10.5921,
    phone: "73227594",
    whatsapp: "55908117",
    email: "patisserie.lilia@example.com",
    openingHours: "Mar – Dim · 9h – 20h",
    guaranteeLevel: "CERTIFIED",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: true,
    verificationSource: "Certificat fourni et visite sur place",
    verifiedMonthsAgo: 5.4,
    joinedMonthsAgo: 12,
    isActive: true,
  },
  {
    slug: "cuisine-de-hela",
    name: "La Cuisine de Hela",
    type: "HOME_SELLER",
    description:
      "Hela roule à la main le couscous de sorgho et la mhamsa de maïs comme le faisait sa grand-mère, et moud elle-même sa bsissa. Ustensiles, tamis et moulin sont réservés au sans gluten.",
    descriptionAr:
      "تفتل هالة الكسكسي بالدرع والمحمّصة بالذرة باليد كما كانت تفعل جدّتها، وتطحن بسيستها بنفسها. الأواني والغرابيل والمطحنة مخصّصة للمنتجات الخالية من الغلوتين.",
    city: "Skanes",
    governorate: "Monastir",
    address: "Skanes — retrait sur rendez-vous",
    latitude: 35.7612,
    longitude: 10.7889,
    phone: "24760381",
    whatsapp: "24760381",
    email: null,
    openingHours: "Sur commande · retrait du lundi au samedi",
    guaranteeLevel: "NATURALLY_GF",
    dedicatedSpace: false,
    dedicatedUtensils: true,
    trainedStaff: true,
    verificationSource: "Visite sur place",
    verifiedMonthsAgo: 5,
    joinedMonthsAgo: 9,
    isActive: true,
  },
  {
    slug: "moulin-el-ghaba",
    name: "Moulin El Ghaba",
    type: "COOPERATIVE",
    description:
      "Petit moulin familial au cœur des oliveraies de Sfax, qui presse à froid les olives Chemlali dans les 24 heures suivant la récolte. Une huile douce et fruitée, mise en bouteille sur place.",
    descriptionAr:
      "معصرة عائلية صغيرة وسط غابات الزيتون بصفاقس، تعصر زيتون الشملالي على البارد خلال 24 ساعة من الجني. زيت لطيف بنكهة فاكهية يُعبّأ في عين المكان.",
    city: "Sfax",
    governorate: "Sfax",
    address: "Route de Gremda, km 7, Sfax",
    latitude: 34.7896,
    longitude: 10.7012,
    phone: "74461932",
    whatsapp: null,
    email: null,
    openingHours: "Lun – Sam · 8h – 17h",
    guaranteeLevel: "NATURALLY_GF",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Visite sur place",
    verifiedMonthsAgo: 8.1,
    joinedMonthsAgo: 13,
    isActive: true,
  },
  {
    slug: "atelier-sabra-kairouan",
    name: "Atelier Sabra",
    type: "BAKERY",
    description:
      "Atelier de makroudh de la médina de Kairouan qui propose, deux jours par semaine, une fournée à la semoule de maïs et aux dattes. Le même atelier travaille aussi la semoule de blé : la fiche est classée « risque de traces ».",
    descriptionAr:
      "ورشة مقروض في المدينة العتيقة بالقيروان تقدّم يومين في الأسبوع دفعة بسميد الذرة والتمر. تستعمل الورشة نفسها سميد القمح أيضًا، لذلك صُنّفت البطاقة «خطر وجود آثار».",
    city: "Kairouan",
    governorate: "Kairouan",
    address: "Médina, près de Bab Ech-Chouhada, Kairouan",
    latitude: 35.6744,
    longitude: 10.1003,
    phone: "77238650",
    whatsapp: "29143875",
    email: null,
    openingHours: "Tous les jours · 8h – 18h (fournée sans gluten : mardi et vendredi)",
    guaranteeLevel: "TRACES_RISK",
    dedicatedSpace: false,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Visite sur place",
    verifiedMonthsAgo: 6.3,
    joinedMonthsAgo: 7,
    isActive: true,
  },
  {
    slug: "dar-el-bharat-djerba",
    name: "Dar El Bharat",
    type: "SPECIALTY_SHOP",
    description:
      "Boutique d'épices du souk de Houmt Souk qui moud elle-même ses mélanges, sans farine ni anti-agglomérant. On y trouve le mélange pour riz djerbien et une mloukhia séchée et moulue sur place.",
    descriptionAr:
      "دكان توابل في سوق حومة السوق يطحن خلطاته بنفسه دون دقيق أو مضادات تكتّل. نجد فيه خليط توابل الرز الجربي والملوخية المجففة والمطحونة في عين المكان.",
    city: "Houmt Souk (Djerba)",
    governorate: "Médenine",
    address: "Souk des épices, Houmt Souk, Djerba",
    latitude: 33.8758,
    longitude: 10.8571,
    phone: "75652471",
    whatsapp: null,
    email: null,
    openingHours: "Lun – Sam · 9h – 13h et 15h – 19h",
    guaranteeLevel: "NATURALLY_GF",
    dedicatedSpace: false,
    dedicatedUtensils: true,
    trainedStaff: false,
    verificationSource: "Appel téléphonique",
    verifiedMonthsAgo: 13.3, // older than 12 months: shown as "à revérifier"
    joinedMonthsAgo: 14,
    isActive: true,
  },
  {
    slug: "cooperative-oasis-nakhla",
    name: "Coopérative Oasis Nakhla",
    type: "COOPERATIVE",
    description:
      "Coopérative de producteurs de dattes de la palmeraie de Tozeur. Les Deglet Nour sont cueillies à la main, triées et conditionnées sur place ; la pâte de dattes est faite uniquement de dattes.",
    descriptionAr:
      "تعاضدية لمنتجي التمور في واحة توزر. تُجنى دقلة النور باليد وتُفرز وتُعلّب في عين المكان، وعجينة التمر مصنوعة من التمر فقط.",
    city: "Tozeur",
    governorate: "Tozeur",
    address: "Route de Nefta, palmeraie de Tozeur",
    latitude: 33.9152,
    longitude: 8.1218,
    phone: "76453296",
    whatsapp: "93871024",
    email: "oasis.nakhla@example.com",
    openingHours: "Lun – Sam · 8h – 15h",
    guaranteeLevel: "NATURALLY_GF",
    dedicatedSpace: true,
    dedicatedUtensils: true,
    trainedStaff: true,
    verificationSource: "Appel téléphonique et échantillons reçus",
    verifiedMonthsAgo: 7.2,
    joinedMonthsAgo: 12,
    isActive: true,
  },
  {
    slug: "epicerie-du-vieux-port",
    name: "Épicerie du Vieux Port",
    type: "GROCERY",
    description:
      "Épicerie du vieux port de Bizerte qui vendait des barres aux dattes faites maison. Activité en pause depuis l'été : la fiche est masquée en attendant une nouvelle vérification.",
    descriptionAr:
      "بقالة في الميناء القديم ببنزرت كانت تبيع أصابع التمر المنزلية. النشاط متوقف منذ الصيف، والبطاقة مخفية في انتظار تحقق جديد.",
    city: "Bizerte",
    governorate: "Bizerte",
    address: "Place du Vieux Port, Bizerte",
    latitude: 37.2744,
    longitude: 9.8739,
    phone: "72439187",
    whatsapp: null,
    email: null,
    openingHours: "Fermé temporairement",
    guaranteeLevel: "TRACES_RISK",
    dedicatedSpace: false,
    dedicatedUtensils: false,
    trainedStaff: false,
    verificationSource: "Appel téléphonique",
    verifiedMonthsAgo: 9.6,
    joinedMonthsAgo: 14,
    isActive: false, // inactive producer: hidden from the public site
  },
];
