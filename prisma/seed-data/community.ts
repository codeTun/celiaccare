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
      "Ma fille est cœliaque depuis ses 4 ans et trouver du bon pain à Tunis était un vrai parcours du combattant. Grâce à vous, nous avons découvert la boulangerie sans gluten de l'ATMC au Kram. Merci pour ce travail, continuez !",
    status: "ARCHIVED",
    adminNote: "Réponse de remerciement envoyée.",
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
    targetType: "PRODUCT",
    targetSlug: "la-seine-makroudh",
    reason: "GLUTEN_CONCERN",
    message:
      "La boutique vend aussi des gâteaux avec gluten. Comment les produits sans gluten sont-ils séparés en vitrine ? Je suis cœliaque.",
    contact: "sonia.b@example.com",
    status: "IN_REVIEW",
    adminNote: "Source vérifiée : unité de production séparée (Managers.tn, oct. 2026). Demander à la boutique comment les vitrines sont séparées.",
    daysAgo: 4,
  },
  {
    targetType: "RESTAURANT",
    targetSlug: "tik-tak-family",
    reason: "OTHER",
    message: "Pouvez-vous ajouter leur carte avec les prix ? J'ai dû les appeler pour les connaître.",
    contact: null,
    status: "OPEN",
    adminNote: null,
    daysAgo: 1,
  },
  {
    targetType: "PRODUCT",
    targetSlug: "ecopasta-couscous-mais",
    reason: "PRICE",
    message: "Le même couscous est affiché à 8,400 DT sur un autre site.",
    contact: null,
    status: "RESOLVED",
    adminNote: "Les prix varient selon les revendeurs : la fiche indique le prix relevé chez Tyfano en novembre 2026.",
    daysAgo: 3,
  },
  {
    targetType: "RESTAURANT",
    targetSlug: "inward",
    reason: "WRONG_INFO",
    message: "Les horaires ne sont pas les mêmes sur Google et sur la fiche.",
    contact: "52 418 903",
    status: "RESOLVED",
    adminNote: "Les sources publiques ne concordent pas : la fiche précise « à confirmer avec le restaurant ».",
    daysAgo: 2,
  },
  {
    targetType: "PRODUCT",
    targetSlug: "lorizo-biscuit-long-amandes",
    reason: "WRONG_INFO",
    message: "La composition complète n'est pas indiquée. Il faudrait au moins signaler les amandes.",
    contact: null,
    status: "RESOLVED",
    adminNote: "La description signale déjà les amandes ; composition complète demandée au fabricant.",
    daysAgo: 5,
  },
  {
    targetType: "PRODUCER",
    targetSlug: "glutella",
    reason: "OTHER",
    message: "Ce serait bien d'ajouter les boutiques où l'on trouve leurs produits à Sousse.",
    contact: null,
    status: "REJECTED",
    adminNote: "Hors du périmètre de la fiche : les produits se commandent sur CeliacCare.",
    daysAgo: 6,
  },
];

// -----------------------------------------------------------------------------
// Reviews (EF-22: published only once APPROVED by the admin)
// -----------------------------------------------------------------------------
export const REVIEWS: SeedReview[] = [
  // The businesses are real: demo reviews are never published (PENDING or REJECTED only), so no
  // invented opinion is ever shown under a real business's name. They let the admin demo moderation.
  { product: "glutella-couscous-sans-gluten", authorName: "Amira D.", rating: 5, comment: "Grain bien séparé, on ne voit pas la différence avec un couscous de blé.", status: "PENDING", daysAgo: 2 },
  { product: "ibn-hayyan-mix-pain", authorName: "Sami K.", rating: 4, comment: "Le pain lève bien, il faut suivre la recette du paquet à la lettre.", status: "PENDING", daysAgo: 3 },
  { product: "la-seine-makroudh", authorName: "Nour A.", rating: 5, comment: "مقروض لذيذ، أخيرًا تستطيع ابنتي أن تأكل حلويات العيد مثل الجميع.", status: "PENDING", daysAgo: 1 },
  { product: "ecopasta-couscous-mais", authorName: "Mehdi K.", rating: 4, comment: "Bon rapport qualité-prix pour un paquet d'un kilo.", status: "PENDING", daysAgo: 4 },
  { product: "glutella-bsissa", authorName: "Hiba J.", rating: 4, comment: "Bonne bsissa, un peu moins sucrée que celle de ma grand-mère.", status: "PENDING", daysAgo: 5 },
  { product: "lorizo-masfouf", authorName: "Salma B.", rating: 5, comment: "Masfouf aux dattes réussi pour l'Aïd, toute la famille en a mangé.", status: "PENDING", daysAgo: 6 },
  { product: "ibn-hayyan-couscous-traditionnel", authorName: "Ines M.", rating: 3, comment: "Correct, mais le grain colle un peu s'il cuit trop longtemps.", status: "PENDING", daysAgo: 2 },
  { restaurant: "inward", authorName: "Rim S.", rating: 5, comment: "Toute la carte est sans gluten, on commande sans stress. Cher, mais très frais.", status: "PENDING", daysAgo: 1 },
  { product: "la-seine-ghrayba", authorName: "Vente directe", rating: 1, comment: "Venez plutôt acheter chez moi, c'est moins cher ! Contact en message privé.", status: "REJECTED", daysAgo: 8 },
];
