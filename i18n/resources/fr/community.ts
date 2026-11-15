/**
 * Texts of the community features (French):
 * - reviews: ratings & comments, published after moderation (EF-22);
 * - report: the "Signaler une erreur" dialog (EF-20).
 * Used by components/community/* and the Server Actions in app/[lang]/actions.ts.
 * {name} is replaced by the name of the product, artisan or restaurant.
 */
export const community = {
  reviews: {
    eyebrow: "Communauté",
    title: "Avis",
    description: "Les retours de la communauté sans gluten, relus par notre équipe avant publication.",
    /** Shown after the big average: "4,6 sur 5" */
    outOf: "sur 5",
    /** Number of published reviews, in every plural form (pluralize() in lib/utils.ts). */
    count: {
      zero: "Aucun avis",
      one: "{count} avis",
      two: "{count} avis",
      few: "{count} avis",
      many: "{count} avis",
      other: "{count} avis",
    },
    noReviewsText: "Soyez le premier à partager votre expérience avec « {name} ».",
    moderated: "Chaque avis est relu par notre équipe avant d'être publié.",
    latestShown: "Affichage des {shown} avis les plus récents.",
    listLabel: "Avis publiés sur « {name} »",
    writeReview: "Donner mon avis",
  },
  reviewForm: {
    title: "Donner mon avis",
    description: "Vous avez goûté « {name} » ? Votre retour aide d'autres personnes cœliaques à choisir en confiance.",
    name: "Votre prénom",
    namePlaceholder: "Ex. Sana",
    nameHint: "Il sera affiché avec votre avis.",
    rating: "Votre note",
    /** Read by screen readers on each star, from 1 to 5. */
    ratingOptions: ["1 étoile", "2 étoiles", "3 étoiles", "4 étoiles", "5 étoiles"],
    /** Shown next to the stars once a note is chosen, from 1 to 5. */
    ratingWords: ["Décevant", "Passable", "Bien", "Très bien", "Excellent"],
    comment: "Votre avis",
    commentPlaceholder: "Goût, texture, fraîcheur, accueil, précautions contre le gluten…",
    commentHint: "Entre 10 et 1000 caractères.",
    submit: "Envoyer mon avis",
    sending: "Envoi…",
    moderationNote: "Votre avis sera publié après vérification par notre équipe.",
    success: "Merci ! Votre avis sera publié après vérification.",
    successText: "Notre équipe relit chaque avis pour garder des informations fiables pour toute la communauté.",
  },
  report: {
    button: "Signaler une erreur",
    title: "Signaler une erreur",
    description:
      "Une information vous semble inexacte sur « {name} » ? Dites-le-nous : chaque signalement est vérifié par notre équipe.",
    reason: "Motif",
    reasonPlaceholder: "Choisissez un motif",
    reasons: {
      WRONG_INFO: "Information erronée",
      GLUTEN_CONCERN: "Problème lié au gluten",
      CLOSED: "Commerce fermé / déménagé",
      PRICE: "Prix incorrect",
      OTHER: "Autre",
    },
    glutenNotice:
      "En cas de symptômes après consommation, consultez un professionnel de santé. Si possible, précisez la date d'achat ou le numéro de lot.",
    message: "Votre message",
    messagePlaceholder: "Décrivez ce que vous avez constaté…",
    messageHint: "Entre 10 et 1000 caractères.",
    contact: "E-mail ou téléphone",
    contactPlaceholder: "Ex. nom@exemple.tn ou 20 123 456",
    contactHint: "Facultatif : seulement si vous souhaitez une réponse.",
    submit: "Envoyer le signalement",
    sending: "Envoi…",
    cancel: "Annuler",
    successTitle: "Signalement envoyé",
    success: "Merci, notre équipe va vérifier sous 72 h.",
  },
  /** Messages returned by the Server Actions. */
  errors: {
    invalid: "Veuillez corriger les champs indiqués.",
    nameLength: "Votre prénom doit contenir entre 2 et 40 caractères.",
    ratingRequired: "Choisissez une note de 1 à 5 étoiles.",
    commentLength: "Votre avis doit contenir entre 10 et 1000 caractères.",
    reasonRequired: "Choisissez un motif.",
    messageLength: "Votre message doit contenir entre 10 et 1000 caractères.",
    contactInvalid: "Indiquez une adresse e-mail valide ou un numéro tunisien à 8 chiffres.",
    tooMany: "Vous avez déjà envoyé plusieurs messages. Réessayez dans une heure.",
    notFound: "Élément introuvable : il a peut-être été retiré du site.",
    generic: "Une erreur est survenue. Réessayez dans un instant.",
  },
};

export type CommunityDict = typeof community;
