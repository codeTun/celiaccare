/**
 * Texts of the checkout /commande and of the order tracking page /suivi (French).
 * The Arabic file must have exactly the same keys.
 */
export const checkout = {
  meta: {
    title: "Finaliser ma commande",
    description: "Indiquez votre adresse de livraison, vérifiez le récapitulatif et confirmez : paiement à la livraison.",
  },
  hero: {
    eyebrow: "Paiement à la livraison",
    title: "Finaliser ma commande",
    description: "Vos coordonnées, un récapitulatif, et c'est envoyé. Aucun compte n'est nécessaire.",
  },
  breadcrumb: "Commande",
  loading: "Chargement de votre commande…",
  steps: {
    label: "Étapes de la commande",
    details: "Livraison",
    review: "Récapitulatif",
    done: "Confirmation",
  },
  empty: {
    title: "Votre panier est vide",
    text: "Ajoutez des produits ou des plats à votre panier avant de passer commande.",
    products: "Voir les produits",
    restaurants: "Voir les restaurants",
    backToCart: "Retour au panier",
  },
  details: {
    title: "Vos informations de livraison",
    intro: "Les champs marqués d'un * sont obligatoires. Ils servent uniquement à vous livrer.",
    contactLegend: "Vos coordonnées",
    addressLegend: "Adresse de livraison",
    paymentLegend: "Mode de paiement",
    continue: "Continuer",
    backToCart: "Modifier le panier",
  },
  fields: {
    fullName: {
      label: "Nom complet",
      placeholder: "Ex. Amira Ben Salah",
    },
    phone: {
      label: "Téléphone",
      placeholder: "20 123 456",
      hint: "Numéro tunisien à 8 chiffres. Nous vous appelons pour confirmer la commande.",
    },
    governorate: {
      label: "Gouvernorat",
      placeholder: "Choisissez votre gouvernorat",
      notCovered: "pas encore desservi",
      outsideRestaurant: "hors zone du restaurant",
      restaurantHint: "Ce restaurant livre uniquement dans le gouvernorat de {governorate}.",
    },
    city: {
      label: "Ville ou délégation",
      placeholder: "Ex. La Marsa",
    },
    street: {
      label: "Rue et numéro",
      placeholder: "Ex. 12 rue de Carthage",
    },
    addressDetails: {
      label: "Précisions utiles",
      placeholder: "Immeuble, étage, point de repère…",
    },
    note: {
      label: "Note pour la livraison",
      placeholder: "Ex. Merci d'appeler en arrivant.",
    },
    consent: {
      before: "J'accepte que mes informations soient utilisées uniquement pour livrer ma commande (voir la ",
      link: "politique de confidentialité",
      after: ").",
    },
  },
  zone: {
    delivery: "Livraison",
    delay: "Délai",
  },
  payment: {
    onDelivery: "Paiement à la livraison",
    CASH_ON_DELIVERY: {
      label: "Espèces à la livraison",
      description: "Vous payez le livreur en espèces à la réception.",
    },
    CARD_ON_DELIVERY: {
      label: "Carte bancaire à la livraison (TPE)",
      description: "Le livreur apporte un terminal de paiement.",
    },
  },
  errors: {
    fullName: "Indiquez votre nom complet (3 à 80 caractères).",
    phone: "Numéro tunisien invalide : 8 chiffres, par exemple 20 123 456.",
    governorate: "Choisissez un gouvernorat desservi.",
    city: "Indiquez votre ville ou délégation.",
    street: "Indiquez la rue et le numéro.",
    addressDetails: "200 caractères au maximum.",
    note: "500 caractères au maximum.",
    paymentMethod: "Choisissez un mode de paiement.",
    consent: "Cochez cette case pour que nous puissions vous livrer.",
    summary: "Veuillez corriger les champs indiqués.",
  },
  review: {
    title: "Vérifiez votre commande",
    intro: "Rien n'est encore envoyé : confirmez pour valider votre commande.",
    delivery: "Livraison",
    payment: "Paiement",
    items: "Articles",
    note: "Note",
    edit: "Modifier",
    editLabel: "Modifier les informations de livraison",
    estimatedDelay: "Délai estimé : {delay}",
    confirm: "Confirmer la commande",
    sending: "Envoi de la commande…",
    commitment: "En confirmant, vous vous engagez à régler la commande à la livraison.",
  },
  summary: {
    title: "Votre commande",
    subtotal: "Sous-total",
    delivery: "Livraison",
    free: "Gratuite",
    total: "Total",
    estimate: "Montant estimé : les prix sont vérifiés à l'envoi de la commande.",
    quantity: "× {quantity}",
  },
  refusals: {
    title: "Commande non envoyée",
    DAILY_LIMIT: "Vous avez atteint le maximum de 3 commandes aujourd'hui. Réessayez demain.",
    BLOCKED:
      "Ce numéro ne peut pas passer de commande en ligne pour le moment. Contactez notre service client au {phone}.",
    UNAVAILABLE_ITEMS: "Ces articles ne sont plus disponibles : {names}.",
    ZONE_NOT_COVERED: "Nous ne livrons pas encore dans le gouvernorat de {governorate}.",
    ZONE_NOT_COVERED_RESTAURANT: "Ce restaurant livre uniquement dans le gouvernorat de {governorate}.",
    MIN_ORDER: "La commande minimum de ce restaurant est de {min}. Ajoutez quelques plats pour continuer.",
    MIXED_CART: "Votre panier contient des articles qui ne peuvent pas être commandés ensemble. Videz-le puis recommencez.",
    EMPTY: "Votre panier est vide.",
    RESTAURANT_UNAVAILABLE: "Ce restaurant ne prend plus de commandes en ligne pour le moment.",
    RATE_LIMIT: "Trop de tentatives depuis cette connexion. Réessayez dans une heure.",
    INVALID: "Certaines informations sont invalides. Corrigez-les puis réessayez.",
    ERROR: "Une erreur est survenue : votre commande n'a pas été envoyée. Réessayez dans un instant.",
    removeItems: "Retirer ces articles du panier",
    editDetails: "Modifier l'adresse",
    addDishes: "Ajouter des plats",
    goToCart: "Voir mon panier",
  },
  confirmation: {
    eyebrow: "Commande envoyée",
    title: "Merci {name} !",
    text: "Votre commande est bien enregistrée. Nous vous appelons au {phone} pour la confirmer.",
    reference: "Référence de commande",
    referenceHint: "Notez-la : elle vous permet de suivre votre commande.",
    copy: "Copier",
    copied: "Copiée !",
    total: "À payer à la livraison",
    subtotal: "Sous-total",
    freeDelivery: "Livraison gratuite",
    delay: "Délai de livraison estimé",
    payment: "Paiement",
    track: "Suivre ma commande",
    continue: "Continuer mes achats",
    nextTitle: "Et maintenant ?",
    nextSteps: [
      "Nous vérifions votre commande et vous appelons pour la confirmer.",
      "Elle est préparée puis confiée au livreur.",
      "Vous payez à la réception, en espèces ou par carte.",
    ],
  },
  /**
   * "Une question sur votre commande ? Contactez CeliacCare" (components/checkout/order-help.tsx) on the
   * checkout, the confirmation and the tracking page: CeliacCare's own contacts (lib/site-config.ts).
   * Every order is followed by CeliacCare, never by the business directly.
   */
  help: {
    title: "Une question sur votre commande ? Contactez CeliacCare",
    /** Checkout, before the order is sent */
    checkoutText: "Notre équipe vous répond avant comme après la commande, et fait le lien avec le commerce pour vous.",
    /** Confirmation and tracking */
    orderText: "Gardez votre référence sous la main : notre équipe suit votre commande et fait le lien avec le commerce.",
    call: "Appeler CeliacCare au",
    whatsapp: "WhatsApp",
    email: "Écrire à CeliacCare à",
    form: "Formulaire de contact",
  },
  tracking: {
    meta: {
      title: "Suivre ma commande",
      description: "Suivez votre commande CeliacCare avec sa référence et votre numéro de téléphone, sans compte.",
    },
    hero: {
      eyebrow: "Suivi de commande",
      title: "Suivre ma commande",
      description: "Entrez la référence reçue à la fin de votre commande et le numéro de téléphone utilisé.",
    },
    form: {
      title: "Retrouver ma commande",
      reference: {
        label: "Référence de commande",
        placeholder: "CC-7K2P9Q",
        hint: "Elle s'affiche à la fin de votre commande.",
      },
      phone: {
        label: "Téléphone utilisé pour la commande",
        placeholder: "20 123 456",
      },
      submit: "Suivre ma commande",
      sending: "Recherche…",
      privacy: "Pour protéger vos données, l'adresse et le téléphone ne sont jamais affichés.",
    },
    errors: {
      reference: "Référence invalide (exemple : CC-7K2P9Q).",
      phone: "Numéro tunisien invalide : 8 chiffres.",
    },
    messages: {
      NOT_FOUND:
        "Commande introuvable. Vérifiez la référence et le numéro de téléphone utilisés pour la commande.",
      RATE_LIMIT: "Trop de recherches depuis cette connexion. Réessayez un peu plus tard.",
      INVALID: "Veuillez corriger les champs indiqués.",
      ERROR: "Une erreur est survenue. Réessayez dans un instant.",
    },
    result: {
      greeting: "Bonjour {name},",
      placedOn: "Commande passée le {date}",
      timeline: "Avancement de la commande",
      currentStep: "Étape actuelle",
      items: "Articles",
      shop: "Épicerie de nos artisans",
      restaurant: "Restaurant : {name}",
      subtotal: "Sous-total",
      delivery: "Livraison",
      free: "Gratuite",
      total: "Total",
      payment: "Paiement",
    },
    statuses: {
      PENDING: "Reçue",
      CONFIRMED: "Confirmée",
      PREPARING: "En préparation",
      OUT_FOR_DELIVERY: "En livraison",
      DELIVERED: "Livrée",
      CANCELLED: "Annulée",
    },
    statusHints: {
      PENDING: "Nous avons bien reçu votre commande. Nous allons vous appeler pour la confirmer.",
      CONFIRMED: "Votre commande est confirmée et sera bientôt préparée.",
      PREPARING: "Votre commande est en cours de préparation.",
      OUT_FOR_DELIVERY: "Le livreur est en route. Préparez le paiement.",
      DELIVERED: "Votre commande a été livrée. Bon appétit !",
      CANCELLED: "Cette commande a été annulée. Contactez-nous pour toute question.",
    },
  },
};

export type CheckoutDict = typeof checkout;
