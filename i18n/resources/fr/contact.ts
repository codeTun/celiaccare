import { siteConfig } from "@/lib/site-config";

/** Texts of the contact page and of its form (French). */
export const contact = {
  meta: {
    title: "Contact",
    description:
      "Une question, une adresse sans gluten à proposer ou un partenariat ? Contactez l'équipe CeliacCare par formulaire, e-mail, téléphone ou WhatsApp.",
  },
  hero: {
    eyebrow: "Contact",
    title: "Écrivez-nous",
    description:
      "Une question sur une commande, une adresse sans gluten à partager, un projet de partenariat ? Notre équipe lit chaque message et vous répond rapidement.",
  },
  form: {
    title: "Envoyer un message",
    intro: "Les champs marqués d'un astérisque (*) sont obligatoires.",
    topic: "Sujet",
    topics: {
      GENERAL: "Question générale",
      PARTNERSHIP: "Devenir partenaire",
      ORDER: "Une commande",
      SUGGESTION: "Proposer une adresse",
      OTHER: "Autre demande",
    },
    name: "Nom complet",
    namePlaceholder: "Ex. : Amel Ben Salah",
    email: "E-mail",
    emailPlaceholder: "vous@exemple.tn",
    phone: "Téléphone",
    phonePlaceholder: "20 123 456",
    reachHint: "Indiquez au moins un e-mail ou un numéro de téléphone pour recevoir notre réponse.",
    subject: "Objet",
    subjectPlaceholders: {
      GENERAL: "Ex. : Comment choisir un produit certifié ?",
      PARTNERSHIP: "Ex. : Pâtisserie sans gluten à Sousse",
      ORDER: "Ex. : Ma commande du 12 novembre",
      SUGGESTION: "Ex. : Un restaurant sans gluten à La Marsa",
      OTHER: "Ex. : Une idée pour CeliacCare",
    },
    message: "Message",
    messageHint: "Entre 10 et 3000 caractères.",
    messagePlaceholders: {
      GENERAL: "Posez-nous votre question…",
      PARTNERSHIP:
        "Présentez votre activité : nom, ville, produits ou plats sans gluten, précautions contre la contamination (atelier séparé, ustensiles dédiés, certification…).",
      ORDER: "Indiquez la référence de votre commande et le numéro de téléphone utilisé, puis décrivez votre demande.",
      SUGGESTION:
        "Nom de l'adresse, ville, ce que vous y avez mangé ou acheté, et les précautions prises contre le gluten…",
      OTHER: "Votre message…",
    },
    consent: "J'accepte que mes données soient utilisées uniquement pour traiter ma demande.",
    privacyLink: "Politique de confidentialité",
    submit: "Envoyer le message",
    sending: "Envoi en cours…",
    successTitle: "Message envoyé, merci !",
    successText: "Nous l'avons bien reçu et nous vous répondrons dès que possible, par e-mail ou par téléphone.",
    writeAnother: "Écrire un autre message",
  },
  // Messages shown under the fields (the form is checked on the server).
  errors: {
    required: "Ce champ est obligatoire.",
    tooLong: "{max} caractères maximum.",
    topic: "Choisissez un sujet.",
    email: "Adresse e-mail invalide.",
    phone: "Numéro tunisien invalide (8 chiffres, ex. 20 123 456).",
    reach: "Indiquez un e-mail ou un numéro de téléphone pour recevoir notre réponse.",
    messageTooShort: "Votre message est trop court (10 caractères minimum).",
    messageTooLong: "Votre message est trop long (3000 caractères maximum).",
    consent: "Merci d'accepter l'utilisation de vos données pour que nous puissions traiter votre demande.",
  },
  details: {
    title: "Nos coordonnées",
    phone: "Téléphone",
    whatsapp: "WhatsApp",
    whatsappText: "Écrivez-nous sur WhatsApp",
    email: "E-mail",
    hours: "Horaires",
    // from lib/site-config.ts (`as string`: the Arabic file translates these values)
    hoursValue: siteConfig.openingHours as string,
    location: "Basés à",
    locationValue: siteConfig.address as string,
    newTab: "(s'ouvre dans un nouvel onglet)",
  },
  partner: {
    title: "Devenir partenaire",
    text: "Artisan, pâtisserie, épicerie ou restaurant : vous proposez des produits ou des plats sans gluten ? Faites-vous connaître des personnes qui en ont besoin.",
    steps: [
      "Présentez votre activité et vos précautions contre le gluten.",
      "Nous vérifions vos ingrédients, vos pratiques et vos éventuels certificats.",
      "Votre fiche est publiée avec son niveau de garantie ; les restaurants conventionnés reçoivent aussi des commandes en ligne.",
    ],
    note: "CeliacCare référence uniquement de petits producteurs et des commerces locaux.",
    cta: "Présenter mon activité",
  },
  suggest: {
    title: "Proposer une adresse",
    text: "Vous connaissez une boulangerie, une épicerie ou un restaurant qui propose du sans gluten ? Dites-le-nous : nous vérifierons l'adresse avant de l'ajouter.",
    cta: "Proposer une adresse",
  },
  order: {
    title: "Une question sur une commande ?",
    text: "Suivez son avancement avec la référence reçue et votre numéro de téléphone.",
    cta: "Suivre ma commande",
  },
  faq: {
    title: "Une réponse rapide ?",
    text: "Paiement, livraison, garanties sans gluten : les réponses aux questions les plus fréquentes.",
    cta: "Consulter la FAQ",
  },
};

export type ContactDict = typeof contact;
