/** Texts of the cart page /panier (French). The Arabic file must have exactly the same keys. */
export const cart = {
  meta: {
    title: "Mon panier",
    description:
      "Votre panier CeliacCare : produits sans gluten de nos artisans ou plats d'un restaurant partenaire, livrés chez vous et payés à la livraison.",
  },
  hero: {
    eyebrow: "Commande",
    title: "Mon panier",
    description: "Vérifiez vos articles, puis passez commande : sans compte, paiement à la livraison.",
  },
  breadcrumb: "Panier",
  loading: "Chargement de votre panier…",
  empty: {
    title: "Votre panier est vide",
    text: "Découvrez les produits sans gluten de nos artisans ou commandez un plat chez un restaurant partenaire.",
    products: "Voir les produits",
    restaurants: "Voir les restaurants",
  },
  header: {
    shop: "Épicerie de nos artisans",
    shopHint: "Produits de petits producteurs tunisiens, livrés par CeliacCare.",
    restaurant: "Restaurant : {name}",
    restaurantHint: "Plats préparés et livrés par le restaurant.",
    seeMenu: "Voir le menu",
  },
  count: {
    one: "1 article",
    other: "{count} articles",
  },
  line: {
    by: "par {name}",
    unitPrice: "{price} l'unité",
    quantity: "Quantité",
    decrease: "Diminuer la quantité",
    increase: "Augmenter la quantité",
    remove: "Retirer",
    removeLabel: "Retirer « {name} » du panier",
    max: "{max} maximum par article",
  },
  clear: {
    button: "Vider le panier",
    title: "Vider le panier ?",
    text: "Tous les articles seront retirés de votre panier.",
    confirm: "Oui, vider le panier",
    cancel: "Annuler",
    close: "Fermer",
  },
  summary: {
    title: "Récapitulatif",
    subtotal: "Sous-total",
    delivery: "Livraison",
    free: "Gratuite",
    total: "Total estimé",
    totalHint: "Les prix sont vérifiés une dernière fois au moment de la commande.",
    checkout: "Passer la commande",
    continueShopping: "Continuer mes achats",
    reassurance: "Sans compte · Paiement à la livraison",
  },
  minOrder: {
    title: "Commande minimum : {min}",
    text: "Ajoutez encore {missing} de plats pour commander chez ce restaurant.",
    action: "Ajouter des plats",
  },
  restaurantClosed: {
    title: "Commande en ligne indisponible",
    text: "Ce restaurant ne prend plus de commandes en ligne pour le moment. Videz le panier pour commander ailleurs.",
  },
  noDelivery: {
    title: "Livraison bientôt disponible",
    text: "Nos zones de livraison ouvrent très bientôt. En attendant, contactez-nous pour commander.",
  },
  tooManyLines: {
    title: "Trop d'articles différents",
    text: "Une commande peut contenir {max} articles différents au maximum. Retirez-en quelques-uns.",
  },
  dailyLimit: {
    title: "{max} commandes par jour maximum",
    text: "Pour éviter les abus, un même numéro de téléphone peut passer {max} commandes par jour au maximum. Le compteur repart à zéro à minuit, heure de Tunis.",
  },
  delivery: {
    title: "Livraison & paiement",
    intro: "Tout ce qu'il faut savoir avant de commander.",
    zonesTitle: "Zones desservies",
    zonesIntro: "Livraison gratuite dans ces gouvernorats ({count}), sans minimum d'achat. Délais indicatifs :",
    governorate: "Gouvernorat",
    delay: "Délai",
    zonesMissing: "Votre gouvernorat n'est pas dans la liste ? Nous ouvrons de nouvelles zones régulièrement : écrivez-nous.",
    noZones: "Aucune zone de livraison n'est ouverte pour le moment.",
    restaurantTitle: "Livraison par le restaurant",
    restaurantArea: "Livraison uniquement dans le gouvernorat de {governorate} (restaurant situé à {city}).",
    restaurantDelivery: "Livraison",
    restaurantTime: "Délai",
    restaurantMin: "Commande minimum",
    paymentTitle: "Paiement à la livraison",
    paymentText: "Aucun paiement en ligne : vous réglez à la réception de votre commande.",
    contactTitle: "Une question ? Contactez CeliacCare",
    contactShop:
      "Une question sur votre commande, un produit ou un plat ? Notre service client vous répond et fait le lien avec le commerce : commande, paiement à la livraison et suivi passent par CeliacCare.",
    call: "Appeler",
    whatsapp: "WhatsApp",
    email: "E-mail",
  },
};

export type CartDict = typeof cart;
