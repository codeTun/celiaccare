/**
 * Community demo data: contact messages, error reports ("Signaler une erreur") and reviews.
 * They are inserted only when the database has no orders yet (first run of the seed).
 * Every person, e-mail and phone number is FICTIONAL (e-mails use the reserved example.com domain).
 *
 * - `daysAgo`: when it was sent, counted back from the day the seed runs.
 * - Reports and reviews point to a product, producer or restaurant by its slug.
 * - In a message, "{reference}" is replaced by the reference of the sender's latest
 *   demo order (the sender must then be a customer of people.ts, found by phone).
 */
import type {
  MessageStatus,
  MessageTopic,
  ReportReason,
  ReportStatus,
  ReportTarget,
  ReviewStatus,
} from "../../types/enums";

export type SeedMessage = {
  name: string;
  email: string | null;
  phone: string | null;
  topic: MessageTopic;
  subject: string;
  message: string;
  status: MessageStatus;
  adminNote: string | null;
  daysAgo: number;
};

export type SeedReport = {
  targetType: ReportTarget;
  /** Slug of the product, producer or restaurant concerned. */
  targetSlug: string;
  reason: ReportReason;
  message: string;
  contact: string | null;
  status: ReportStatus;
  adminNote: string | null;
  daysAgo: number;
};

export type SeedReview = {
  /** Slug of the reviewed product... */
  product?: string;
  /** ...or of the reviewed restaurant. */
  restaurant?: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  status: ReviewStatus;
  daysAgo: number;
};

// -----------------------------------------------------------------------------
// Contact messages
// -----------------------------------------------------------------------------
export const CONTACT_MESSAGES: SeedMessage[] = [
  {
    name: "Rafik Mestiri",
    email: "rafik.mestiri@example.com",
    phone: "98457203",
    topic: "PARTNERSHIP",
    subject: "Restaurant à Sfax : devenir partenaire",
    message:
      "Bonjour, je gère un restaurant de cuisine tunisienne route de Gremda à Sfax. Depuis un an, nous servons un couscous de maïs et des desserts sans gluten, préparés avec des ustensiles séparés. Nous aimerions devenir restaurant conventionné et proposer la livraison sur CeliacCare. Quelles sont les conditions et les étapes ?",
    status: "NEW",
    adminNote: null,
    daysAgo: 1,
  },
  {
    name: "Rym Boughanmi",
    email: "rym.boughanmi@example.com",
    phone: null,
    topic: "SUGGESTION",
    subject: "Une pâtisserie sans gluten à Gabès",
    message:
      "Je vous propose une adresse : une petite pâtisserie près du marché de Jara, à Gabès, prépare des ghraiba au pois chiche et des gâteaux au riz sur commande. Il n'y a encore aucune adresse à Gabès sur le site, ce serait génial de l'ajouter !",
    status: "IN_PROGRESS",
    adminNote: "Appel prévu jeudi pour vérifier les pratiques (farines utilisées, ustensiles, four partagé ?).",
    daysAgo: 9,
  },
  {
    name: "Mariem Selmi",
    email: null,
    phone: "23574196",
    topic: "ORDER",
    subject: "Commande {reference} : livraison en soirée ?",
    message:
      "Bonjour, j'ai passé la commande {reference}. Est-ce possible d'être livrée après 18 h ? Je ne suis pas à la maison avant. Merci !",
    status: "RESOLVED",
    adminNote: "Cliente rappelée : livraison décalée à 18 h 30 avec le livreur.",
    daysAgo: 12,
  },
  {
    name: "Oussama Karray",
    email: "oussama.karray@example.com",
    phone: "92860134",
    topic: "ORDER",
    subject: "Paiement par carte à Sousse ?",
    message: "Bonjour, est-ce que le livreur accepte la carte bancaire à Sousse, ou seulement les espèces ?",
    status: "RESOLVED",
    adminNote: "Répondu : la carte est acceptée à la livraison dans le Sahel (terminal mobile du livreur).",
    daysAgo: 25,
  },
  {
    name: "Nadia Hamrouni",
    email: "nadia.hamrouni@example.com",
    phone: null,
    topic: "GENERAL",
    subject: "Merci pour ce site !",
    message:
      "Ma fille est cœliaque depuis ses 4 ans et trouver du bon pain à Tunis était un vrai parcours du combattant. Grâce à vous, nous avons découvert le Fournil Yasmine. Merci pour ce travail, continuez !",
    status: "ARCHIVED",
    adminNote: "Message transmis au Fournil Yasmine, avec l'accord de la cliente.",
    daysAgo: 60,
  },
  {
    name: "Khaled Baccar",
    email: "khaled.baccar@example.com",
    phone: null,
    topic: "GENERAL",
    subject: "Une application mobile ?",
    message: "Avez-vous une application mobile ? Je commande souvent depuis mon téléphone.",
    status: "RESOLVED",
    adminNote: "Répondu : pas d'application pour l'instant, mais le site peut être ajouté à l'écran d'accueil du téléphone.",
    daysAgo: 33,
  },
  {
    name: "Zohra Ben Naceur",
    email: null,
    phone: "75491306",
    topic: "PARTNERSHIP",
    subject: "Productrice de pâte de dattes à Douz",
    message:
      "Bonjour, je prépare de la pâte de dattes et du rob à Douz avec ma famille, sans aucun ajout. Est-ce que je peux vendre mes produits sur votre site ?",
    status: "IN_PROGRESS",
    adminNote: "Kébili n'est pas encore desservie : étudier un envoi groupé avec la coopérative de Tozeur.",
    daysAgo: 15,
  },
  {
    name: "Selim Ghannem",
    email: "selim.ghannem@example.com",
    phone: null,
    topic: "SUGGESTION",
    subject: "Un filtre « sans lactose »",
    message:
      "Ce serait pratique de pouvoir filtrer les produits sans lait : mon fils est cœliaque et intolérant au lactose, je lis chaque fiche une par une.",
    status: "NEW",
    adminNote: null,
    daysAgo: 2,
  },
  {
    name: "Asma Kchaou",
    email: "asma.kchaou@example.com",
    phone: "24350718",
    topic: "OTHER",
    subject: "Goûter pour des enfants cœliaques à Sousse",
    message:
      "Nous sommes une quinzaine de familles d'enfants cœliaques à Sousse. Nous organisons un goûter sans gluten en décembre et cherchons des artisans pour une dégustation. Pouvez-vous nous mettre en relation ?",
    status: "NEW",
    adminNote: null,
    daysAgo: 4,
  },
  {
    name: "Tarek Ben Hmida",
    email: null,
    phone: "98316724",
    topic: "ORDER",
    subject: "Livraison à Tataouine",
    message:
      "Bonjour, j'habite à Tataouine. Quand est-ce que la livraison sera possible chez nous ? Je suis prêt à payer un peu plus cher.",
    status: "RESOLVED",
    adminNote: "Zone pas encore couverte : numéro ajouté à la liste d'attente, rappel prévu à l'ouverture.",
    daysAgo: 20,
  },
];

// -----------------------------------------------------------------------------
// Error reports ("Signaler une erreur", EF-20 / EF-23)
// -----------------------------------------------------------------------------
export const REPORTS: SeedReport[] = [
  {
    targetType: "PRODUCER",
    targetSlug: "dar-el-bharat-djerba",
    reason: "WRONG_INFO",
    message: "Les horaires ont changé : la boutique est maintenant fermée le vendredi après-midi et ouvre à 10 h.",
    contact: null,
    status: "OPEN",
    adminNote: null,
    daysAgo: 3,
  },
  {
    targetType: "PRODUCT",
    targetSlug: "makroudh-kairouan-mais",
    reason: "GLUTEN_CONCERN",
    message:
      "Mon fils a eu des symptômes après en avoir mangé. Sur place, on m'a dit que la friture se fait dans la même huile que le makroudh au blé.",
    contact: "hajer.mabrouk@example.com",
    status: "IN_REVIEW",
    adminNote: "Atelier contacté, visite prévue mardi. Fiche déjà classée « risque de traces » ; vérifier l'huile de friture.",
    daysAgo: 6,
  },
  {
    targetType: "RESTAURANT",
    targetSlug: "relais-des-orangers-hammamet",
    reason: "CLOSED",
    message: "Le restaurant est fermé pour travaux jusqu'à début janvier (affiche sur la porte).",
    contact: null,
    status: "OPEN",
    adminNote: null,
    daysAgo: 1,
  },
  {
    targetType: "PRODUCT",
    targetSlug: "halwa-chamia-pistaches",
    reason: "PRICE",
    message: "En magasin, la boîte de 400 g est affichée à 10,500 DT et non à 9,900 DT.",
    contact: null,
    status: "RESOLVED",
    adminNote: "Prix vérifié par téléphone : le magasin garde 9,900 DT pour les commandes en ligne.",
    daysAgo: 40,
  },
  {
    targetType: "RESTAURANT",
    targetSlug: "le-pecheur-la-goulette",
    reason: "WRONG_INFO",
    message: "Le numéro WhatsApp affiché ne répond pas.",
    contact: "karim.b@example.com",
    status: "RESOLVED",
    adminNote: "Numéro WhatsApp vérifié avec le restaurant et corrigé.",
    daysAgo: 18,
  },
  {
    targetType: "PRODUCT",
    targetSlug: "financiers-amandes",
    reason: "WRONG_INFO",
    message: "Il faudrait indiquer que les financiers contiennent du lait.",
    contact: null,
    status: "REJECTED",
    adminNote: "Le beurre est déjà indiqué comme allergène sur la fiche ; la recette ne contient pas d'autre produit laitier.",
    daysAgo: 27,
  },
];

// -----------------------------------------------------------------------------
// Reviews (EF-22: published only once APPROVED by the admin)
// -----------------------------------------------------------------------------
export const REVIEWS: SeedReview[] = [
  // --- Products ---------------------------------------------------------------------------
  { product: "pain-de-mie-riz-sarrasin", authorName: "Amira D.", rating: 5, comment: "Enfin un pain de mie qui ne s'émiette pas ! Mon fils l'emporte à l'école tous les jours.", status: "APPROVED", daysAgo: 120 },
  { product: "pain-de-mie-riz-sarrasin", authorName: "Sami K.", rating: 4, comment: "Très bon grillé le matin. Un peu cher, mais la qualité est là.", status: "APPROVED", daysAgo: 64 },
  { product: "pain-de-mie-riz-sarrasin", authorName: "Nour A.", rating: 5, comment: "خبز طري ولذيذ، أخيرًا تستطيع ابنتي أن تأكل سندويتش مثل صديقاتها.", status: "APPROVED", daysAgo: 21 },
  { product: "pain-de-mie-riz-sarrasin", authorName: "Vente directe", rating: 2, comment: "Trop cher ! Venez plutôt acheter chez moi, je vends le même à moitié prix.", status: "REJECTED", daysAgo: 22 },
  { product: "baguette-sans-gluten", authorName: "Mehdi K.", rating: 4, comment: "Croustillante après cinq minutes au four, comme promis. On ne voit presque pas la différence.", status: "APPROVED", daysAgo: 88 },
  { product: "baguette-sans-gluten", authorName: "Ines M.", rating: 3, comment: "Bonne le jour même, mais elle durcit vite le lendemain.", status: "APPROVED", daysAgo: 37 },
  { product: "croissants-pur-beurre", authorName: "Salma B.", rating: 5, comment: "Des croissants feuilletés et bien beurrés : le dimanche matin a retrouvé le sourire.", status: "APPROVED", daysAgo: 52 },
  { product: "croissants-pur-beurre", authorName: "Rania T.", rating: 5, comment: "Je les congèle et je les sors au fur et à mesure, parfait.", status: "PENDING", daysAgo: 2 },
  { product: "pizza-margherita-surgelee", authorName: "Bilel Z.", rating: 4, comment: "Pâte fine et croustillante, il manque juste un peu de sauce.", status: "APPROVED", daysAgo: 45 },
  { product: "feuilles-de-brik-sans-gluten", authorName: "Mariem S.", rating: 5, comment: "Les briks à l'œuf comme avant ! Les feuilles se plient bien et ne se déchirent pas.", status: "APPROVED", daysAgo: 140 },
  { product: "farine-sans-gluten-tout-usage", authorName: "Hiba J.", rating: 5, comment: "Je l'utilise à la place de la farine dans toutes mes recettes de gâteaux, aucun échec.", status: "APPROVED", daysAgo: 98 },
  { product: "melange-pain-maison", authorName: "Karim A.", rating: 4, comment: "Le pain lève bien et la recette au dos est claire. J'ajoute des graines de lin.", status: "APPROVED", daysAgo: 30 },
  { product: "spaghetti-riz-mais", authorName: "Emna B.", rating: 4, comment: "Ils ne collent pas si on respecte le temps de cuisson. Mes enfants n'ont pas vu la différence.", status: "APPROVED", daysAgo: 77 },
  { product: "granola-miel-amandes", authorName: "Wassim D.", rating: 5, comment: "Le meilleur granola que j'ai goûté, pas trop sucré et très croquant.", status: "APPROVED", daysAgo: 59 },
  { product: "granola-miel-amandes", authorName: "Leila B.", rating: 4, comment: "Délicieux. Il contient de l'avoine, même certifiée : c'est bien indiqué sur la fiche.", status: "APPROVED", daysAgo: 26 },
  { product: "granola-miel-amandes", authorName: "Gagnez vite", rating: 5, comment: "Gagnez de l'argent depuis chez vous, cliquez sur mon profil !", status: "REJECTED", daysAgo: 9 },
  { product: "crackers-lin-sarrasin", authorName: "Achref H.", rating: 5, comment: "Parfaits à l'apéritif avec une méchouia. Le sachet part en une soirée.", status: "APPROVED", daysAgo: 18 },
  { product: "chips-de-pois-chiches", authorName: "Samia M.", rating: 4, comment: "Croustillantes et pas grasses, le piment est doux.", status: "PENDING", daysAgo: 4 },
  { product: "ghraiba-pois-chiche", authorName: "Cyrine S.", rating: 5, comment: "La ghraiba de mon enfance, elle fond dans la bouche. Bravo Mounira !", status: "APPROVED", daysAgo: 110 },
  { product: "ghraiba-pois-chiche", authorName: "Dorra M.", rating: 5, comment: "غريبة رائعة تذوب في الفم، طلبتها للعيد وأعجبت الجميع.", status: "APPROVED", daysAgo: 70 },
  { product: "ghraiba-pois-chiche", authorName: "Ghassen O.", rating: 4, comment: "Très bonne, un peu trop sucrée à mon goût.", status: "APPROVED", daysAgo: 12 },
  { product: "makroudh-dattes-sans-gluten", authorName: "Asma K.", rating: 5, comment: "Croustillant et pas gras, on dirait le makroudh de ma grand-mère.", status: "APPROVED", daysAgo: 95 },
  { product: "kaak-warka-sans-gluten", authorName: "Fatma J.", rating: 5, comment: "Commandé pour un mariage : tout le monde en a redemandé et personne n'a deviné qu'il était sans gluten.", status: "APPROVED", daysAgo: 80 },
  { product: "bsissa-sorgho-pois-chiches", authorName: "Houssem G.", rating: 3, comment: "Bon goût, mais j'aurais préféré un moulin séparé. C'est honnête de l'indiquer.", status: "APPROVED", daysAgo: 160 },
  { product: "halwa-chamia-pistaches", authorName: "Rim S.", rating: 4, comment: "Généreuse en pistaches. Le risque de traces est bien signalé.", status: "APPROVED", daysAgo: 130 },
  { product: "couscous-de-mais-fin", authorName: "Moez T.", rating: 4, comment: "Il gonfle bien, il faut juste bien l'huiler avant la deuxième vapeur.", status: "APPROVED", daysAgo: 66 },
  { product: "harissa-traditionnelle-cap-bon", authorName: "Oussama K.", rating: 5, comment: "Une vraie harissa à l'ancienne, très parfumée. Je n'achète plus que celle-là.", status: "APPROVED", daysAgo: 102 },
  { product: "harissa-traditionnelle-cap-bon", authorName: "Chaima B.", rating: 5, comment: "هريسة عربي بنينة برشا، تذكّرني بهريسة جدّتي في نابل.", status: "APPROVED", daysAgo: 41 },
  { product: "tabel-du-cap-bon", authorName: "Nesrine G.", rating: 4, comment: "Très parfumé, une cuillère suffit pour toute la marmite.", status: "APPROVED", daysAgo: 55 },
  { product: "financiers-amandes", authorName: "Zied B.", rating: 5, comment: "Moelleux, pas trop sucrés, parfaits pour le goûter.", status: "APPROVED", daysAgo: 47 },
  { product: "brownie-chocolat-noisettes", authorName: "Khadija L.", rating: 5, comment: "Fondant et très chocolaté, il a fait l'unanimité à l'anniversaire de ma fille.", status: "APPROVED", daysAgo: 33 },
  { product: "brownie-chocolat-noisettes", authorName: "Ahmed S.", rating: 4, comment: "Excellent, un peu cher pour la taille.", status: "PENDING", daysAgo: 1 },
  { product: "sables-vanille", authorName: "Sonia Z.", rating: 5, comment: "Les enfants les adorent, la boîte ne dure pas deux jours.", status: "APPROVED", daysAgo: 74 },
  { product: "couscous-sorgho-roule-main", authorName: "Malek B.", rating: 5, comment: "Le goût du couscous d'autrefois. Roulé à la main, ça se sent.", status: "APPROVED", daysAgo: 115 },
  { product: "couscous-sorgho-roule-main", authorName: "Imen F.", rating: 4, comment: "Très bon, il faut prévoir une vapeur de plus qu'avec un couscous classique.", status: "APPROVED", daysAgo: 29 },
  { product: "bsissa-maison-sorgho", authorName: "Mohamed M.", rating: 5, comment: "بسيسة لذيذة ومطحونة كما يجب، نتناولها كل صباح مع زيت الزيتون.", status: "APPROVED", daysAgo: 50 },
  { product: "huile-olive-chemlali-1l", authorName: "Wafa K.", rating: 5, comment: "Douce et fruitée, parfaite avec la bsissa.", status: "APPROVED", daysAgo: 85 },
  { product: "dattes-deglet-nour", authorName: "Skander H.", rating: 5, comment: "Des dattes translucides et mielleuses, la qualité de Tozeur.", status: "APPROVED", daysAgo: 38 },
  { product: "dattes-deglet-nour", authorName: "Mouna C.", rating: 4, comment: "Très bonnes, quelques dattes un peu sèches au fond de la boîte.", status: "PENDING", daysAgo: 3 },
  { product: "pate-de-dattes-ajina", authorName: "Hamza E.", rating: 5, comment: "Pâte de dattes pure, parfaite pour mes makroudh maison.", status: "APPROVED", daysAgo: 90 },
  { product: "makroudh-kairouan-mais", authorName: "Sabrine B.", rating: 2, comment: "Bon goût, mais j'ai un doute sur la friture. Je préfère attendre la nouvelle vérification.", status: "PENDING", daysAgo: 5 },
  { product: "mloukhia-moulue", authorName: "Lotfi G.", rating: 4, comment: "Bien noire et parfumée, rien à redire.", status: "APPROVED", daysAgo: 140 },

  // --- Restaurants ------------------------------------------------------------------------
  { restaurant: "dar-el-ward", authorName: "Mariem S.", rating: 5, comment: "Le couscous de sorgho est un délice et l'équipe connaît vraiment le sans gluten. On reviendra !", status: "APPROVED", daysAgo: 125 },
  { restaurant: "dar-el-ward", authorName: "Youssef H.", rating: 4, comment: "Très bonne kamounia, livraison un peu longue un vendredi soir.", status: "APPROVED", daysAgo: 61 },
  { restaurant: "dar-el-ward", authorName: "Salma B.", rating: 5, comment: "أفضل شربة أكلتها منذ سنوات، ودون فريك! شكرًا.", status: "APPROVED", daysAgo: 19 },
  { restaurant: "dar-el-ward", authorName: "Bilel Z.", rating: 3, comment: "Bon repas, mais la brik est arrivée un peu molle.", status: "APPROVED", daysAgo: 8 },
  { restaurant: "dar-el-ward", authorName: "Promo Auto", rating: 5, comment: "Meilleur restaurant de Tunis ! Et venez voir ma page de vente de voitures d'occasion.", status: "REJECTED", daysAgo: 16 },
  { restaurant: "le-pecheur-la-goulette", authorName: "Sarra K.", rating: 5, comment: "Poisson ultra frais et couscous de maïs parfait. Le serveur a vérifié chaque plat avec la cuisine.", status: "APPROVED", daysAgo: 100 },
  { restaurant: "le-pecheur-la-goulette", authorName: "Mehdi K.", rating: 4, comment: "Kabkabou excellent, prix un peu élevés mais c'est la qualité.", status: "APPROVED", daysAgo: 43 },
  { restaurant: "le-pecheur-la-goulette", authorName: "Nour A.", rating: 2, comment: "Commande arrivée tiède, avec quarante minutes de retard.", status: "PENDING", daysAgo: 1 },
  { restaurant: "bol-vert-menzah", authorName: "Hiba J.", rating: 5, comment: "Un restaurant où je peux tout commander sans poser de questions, ça n'a pas de prix.", status: "APPROVED", daysAgo: 92 },
  { restaurant: "bol-vert-menzah", authorName: "Karim A.", rating: 5, comment: "Le bowl poulet sauce yaourt est copieux et frais.", status: "APPROVED", daysAgo: 35 },
  { restaurant: "bol-vert-menzah", authorName: "Emna B.", rating: 4, comment: "Très bon fondant au sarrasin, portions un peu petites.", status: "APPROVED", daysAgo: 14 },
  { restaurant: "forno-libero-sousse", authorName: "Chaima B.", rating: 5, comment: "La pizza tunisienne est incroyable, pâte croustillante. Mes enfants cœliaques étaient ravis.", status: "APPROVED", daysAgo: 118 },
  { restaurant: "forno-libero-sousse", authorName: "Oussama K.", rating: 4, comment: "Bonne pizza, livraison rapide à Sahloul.", status: "APPROVED", daysAgo: 57 },
  { restaurant: "forno-libero-sousse", authorName: "Nesrine G.", rating: 5, comment: "بيتزا خالية من الغلوتين ولذيذة جدًا، أنصح بها.", status: "APPROVED", daysAgo: 24 },
  { restaurant: "le-grill-du-sahel", authorName: "Khadija L.", rating: 5, comment: "Grillade mixte généreuse et merguez maison sans chapelure, enfin !", status: "APPROVED", daysAgo: 72 },
  { restaurant: "le-grill-du-sahel", authorName: "Ahmed S.", rating: 4, comment: "Des frites cuites dans une friteuse dédiée, c'est rassurant. Côtelettes un peu trop cuites.", status: "APPROVED", daysAgo: 31 },
  { restaurant: "salon-de-the-nesma", authorName: "Rim S.", rating: 5, comment: "Crêpe au sarrasin miel-amandes et thé aux pignons face à la mer : parfait.", status: "APPROVED", daysAgo: 40 },
  { restaurant: "salon-de-the-nesma", authorName: "Houssem G.", rating: 4, comment: "L'assiette de douceurs est très bonne, service un peu lent le dimanche.", status: "PENDING", daysAgo: 2 },
  { restaurant: "el-bahja-djerba", authorName: "Sabrine B.", rating: 3, comment: "Riz djerbien délicieux, mais pas de cuisine séparée : à éviter pour les plus sensibles.", status: "APPROVED", daysAgo: 105 },
  { restaurant: "relais-des-orangers-hammamet", authorName: "Nizar B.", rating: 4, comment: "Couscous de maïs au poulet très réussi. Il faut bien préciser « sans gluten » en commandant.", status: "APPROVED", daysAgo: 82 },
];
