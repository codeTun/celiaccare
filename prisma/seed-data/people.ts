/**
 * Customers used to build the demo orders, plus the phone rules of the admin panel (EF-39).
 * Every name, address and phone number is FICTIONAL.
 *
 * - There are no customer accounts: a customer is a phone number (8 digits, no spaces).
 * - Customers only live in governorates where delivery is open (delivery.ts).
 * - Restaurant orders go to customers of the restaurant's own governorate.
 * - `ordersOften`: 1 = orders now and then, 3 = loyal customer who orders often.
 */
import type { Governorate } from "../../lib/tunisia";
import type { PhoneRuleType } from "../../types/enums";

export type SeedCustomer = {
  firstName: string;
  lastName: string;
  phone: string;
  governorate: Governorate;
  city: string;
  street: string;
  addressDetails: string | null;
  ordersOften: 1 | 2 | 3;
};

export type SeedPhoneRule = {
  phone: string;
  type: PhoneRuleType;
  /** Only for EXCEPTION rules: orders allowed per day. */
  maxPerDay: number | null;
  reason: string;
  /** When the admin created the rule (days before the seed runs). */
  createdDaysAgo: number;
  /** null = never expires. */
  expiresInDays: number | null;
};

export const CUSTOMERS: SeedCustomer[] = [
  // --- Tunis ----------------------------------------------------------------------------
  { firstName: "Amira", lastName: "Dhaouadi", phone: "22314587", governorate: "Tunis", city: "La Marsa", street: "9, rue du Maroc", addressDetails: "Villa au portail vert", ordersOften: 3 },
  { firstName: "Mehdi", lastName: "Khelifi", phone: "98653120", governorate: "Tunis", city: "Le Bardo", street: "27, avenue Habib Bourguiba", addressDetails: "2e étage, porte de droite", ordersOften: 2 },
  { firstName: "Salma", lastName: "Ben Youssef", phone: "55219874", governorate: "Tunis", city: "Lafayette", street: "14, rue de Palestine", addressDetails: "Immeuble Les Jasmins, 4e étage", ordersOften: 2 },
  { firstName: "Youssef", lastName: "Hammami", phone: "93578214", governorate: "Tunis", city: "El Menzah 1", street: "6, rue Ibn Sina", addressDetails: null, ordersOften: 1 },
  { firstName: "Ines", lastName: "Mansouri", phone: "24860317", governorate: "Tunis", city: "Carthage", street: "3, rue Hannibal", addressDetails: "Sonner chez Mansouri", ordersOften: 2 },
  { firstName: "Bilel", lastName: "Zouari", phone: "50147296", governorate: "Tunis", city: "Le Kram", street: "45, avenue de la République", addressDetails: null, ordersOften: 1 },
  { firstName: "Nour", lastName: "Abidi", phone: "21986543", governorate: "Tunis", city: "Montplaisir", street: "5, rue de l'Artisanat", addressDetails: "Bureau au rez-de-chaussée", ordersOften: 2 },
  { firstName: "Rania", lastName: "Toumi", phone: "58301462", governorate: "Tunis", city: "Mutuelleville", street: "33, avenue Jugurtha", addressDetails: null, ordersOften: 1 },
  { firstName: "Hamza", lastName: "Ellouze", phone: "92745108", governorate: "Tunis", city: "Cité El Khadra", street: "Bloc 12, appartement 7", addressDetails: null, ordersOften: 1 },
  { firstName: "Sarra", lastName: "Kammoun", phone: "26413879", governorate: "Tunis", city: "La Goulette", street: "8, avenue Franklin Roosevelt", addressDetails: "Au-dessus de la pharmacie", ordersOften: 2 },
  // --- Ariana -----------------------------------------------------------------------------
  { firstName: "Mariem", lastName: "Selmi", phone: "23574196", governorate: "Ariana", city: "Ennasr", street: "Résidence Yasmine, Ennasr 2", addressDetails: "Bloc B, 3e étage", ordersOften: 3 },
  { firstName: "Karim", lastName: "Ayari", phone: "97106428", governorate: "Ariana", city: "El Menzah 6", street: "21, rue des Orangers", addressDetails: null, ordersOften: 2 },
  { firstName: "Hiba", lastName: "Jlassi", phone: "52683901", governorate: "Ariana", city: "La Soukra", street: "Route de la Soukra, km 4", addressDetails: "Villa n° 17", ordersOften: 2 },
  { firstName: "Aymen", lastName: "Nasri", phone: "29418356", governorate: "Ariana", city: "Ariana Ville", street: "12, avenue de l'Indépendance", addressDetails: null, ordersOften: 1 },
  { firstName: "Emna", lastName: "Bouslama", phone: "56372819", governorate: "Ariana", city: "El Ghazela", street: "Cité El Ghazela, rue 6", addressDetails: "Maison au portail bleu", ordersOften: 2 },
  { firstName: "Firas", lastName: "Labidi", phone: "94251763", governorate: "Ariana", city: "Raoued", street: "Cité Ennkhilet", addressDetails: null, ordersOften: 1 },
  { firstName: "Olfa", lastName: "Chouchane", phone: "25907314", governorate: "Ariana", city: "Mnihla", street: "Avenue Habib Bourguiba", addressDetails: null, ordersOften: 1 },
  // --- Ben Arous --------------------------------------------------------------------------
  { firstName: "Wassim", lastName: "Dridi", phone: "53816402", governorate: "Ben Arous", city: "El Mourouj", street: "Rue des Roses, El Mourouj 4", addressDetails: null, ordersOften: 2 },
  { firstName: "Leila", lastName: "Ben Ammar", phone: "98027461", governorate: "Ben Arous", city: "Ezzahra", street: "15, avenue de la Plage", addressDetails: "Résidence Les Mimosas, appartement 12", ordersOften: 2 },
  { firstName: "Achref", lastName: "Hamdi", phone: "20635918", governorate: "Ben Arous", city: "Radès", street: "Rue de la Gare", addressDetails: null, ordersOften: 1 },
  { firstName: "Cyrine", lastName: "Saidi", phone: "57294630", governorate: "Ben Arous", city: "Hammam Lif", street: "9, avenue Habib Bourguiba", addressDetails: null, ordersOften: 1 },
  { firstName: "Slim", lastName: "Feki", phone: "93140685", governorate: "Ben Arous", city: "Mégrine", street: "Cité Sidi Rezig", addressDetails: null, ordersOften: 1 },
  // --- Manouba ----------------------------------------------------------------------------
  { firstName: "Dorra", lastName: "Mzoughi", phone: "24719853", governorate: "Manouba", city: "Manouba", street: "Cité Errafaha", addressDetails: null, ordersOften: 1 },
  { firstName: "Ghassen", lastName: "Ouertani", phone: "51846207", governorate: "Manouba", city: "Den Den", street: "Rue de la Mosquée", addressDetails: null, ordersOften: 1 },
  // --- Nabeul -----------------------------------------------------------------------------
  { firstName: "Asma", lastName: "Khemiri", phone: "22408597", governorate: "Nabeul", city: "Nabeul", street: "Avenue Farhat Hached", addressDetails: null, ordersOften: 1 },
  { firstName: "Nizar", lastName: "Bahri", phone: "96253180", governorate: "Nabeul", city: "Hammamet", street: "Yasmine Hammamet, résidence Les Palmiers", addressDetails: null, ordersOften: 1 },
  { firstName: "Fatma", lastName: "Jendoubi", phone: "54916023", governorate: "Nabeul", city: "Kélibia", street: "Rue de la Corniche", addressDetails: null, ordersOften: 1 },
  // --- Bizerte ----------------------------------------------------------------------------
  { firstName: "Houssem", lastName: "Ghorbel", phone: "23681049", governorate: "Bizerte", city: "Bizerte", street: "Rue d'Espagne", addressDetails: null, ordersOften: 2 },
  { firstName: "Rim", lastName: "Sellami", phone: "99504726", governorate: "Bizerte", city: "Bizerte", street: "Corniche, résidence Les Mouettes", addressDetails: "Appartement 5", ordersOften: 2 },
  { firstName: "Moez", lastName: "Tlili", phone: "50672813", governorate: "Bizerte", city: "Menzel Bourguiba", street: "Avenue de la Liberté", addressDetails: null, ordersOften: 1 },
  // --- Sousse -----------------------------------------------------------------------------
  { firstName: "Chaima", lastName: "Ben Hassine", phone: "28319457", governorate: "Sousse", city: "Khezama", street: "Rue Ibn Khaldoun, Khezama Est", addressDetails: null, ordersOften: 2 },
  { firstName: "Oussama", lastName: "Karray", phone: "92860134", governorate: "Sousse", city: "Sahloul", street: "Résidence Sahloul 3", addressDetails: "Bloc C", ordersOften: 2 },
  { firstName: "Nesrine", lastName: "Guesmi", phone: "55741290", governorate: "Sousse", city: "Hammam Sousse", street: "Avenue de la Corniche", addressDetails: null, ordersOften: 1 },
  { firstName: "Zied", lastName: "Baccouche", phone: "21378645", governorate: "Sousse", city: "Msaken", street: "Rue du Marché", addressDetails: null, ordersOften: 1 },
  // --- Monastir ---------------------------------------------------------------------------
  { firstName: "Khadija", lastName: "Lahmar", phone: "98714320", governorate: "Monastir", city: "Monastir", street: "Avenue Habib Bourguiba", addressDetails: null, ordersOften: 2 },
  { firstName: "Ahmed", lastName: "Sassi", phone: "24093516", governorate: "Monastir", city: "Skanes", street: "Route de la Corniche", addressDetails: null, ordersOften: 2 },
  { firstName: "Sonia", lastName: "Zribi", phone: "53260874", governorate: "Monastir", city: "Moknine", street: "Rue de Tunis", addressDetails: null, ordersOften: 1 },
  // --- Mahdia, Sfax, Kairouan, Gabès, Médenine, Béja, Zaghouan ------------------------------
  { firstName: "Malek", lastName: "Ben Hassen", phone: "26845073", governorate: "Mahdia", city: "Mahdia", street: "Zone touristique", addressDetails: null, ordersOften: 1 },
  { firstName: "Imen", lastName: "Fourati", phone: "22957130", governorate: "Sfax", city: "Sfax", street: "Route de Tunis, km 3", addressDetails: "Immeuble Ennour, 2e étage", ordersOften: 2 },
  { firstName: "Mohamed", lastName: "Masmoudi", phone: "97436281", governorate: "Sfax", city: "Sakiet Ezzit", street: "Route de Mahdia", addressDetails: null, ordersOften: 1 },
  { firstName: "Wafa", lastName: "Kallel", phone: "50981347", governorate: "Sfax", city: "Sfax", street: "Route El Ain, km 2", addressDetails: null, ordersOften: 1 },
  { firstName: "Skander", lastName: "Hajji", phone: "29716408", governorate: "Kairouan", city: "Kairouan", street: "Avenue de la République", addressDetails: null, ordersOften: 1 },
  { firstName: "Mouna", lastName: "Chebil", phone: "52038619", governorate: "Gabès", city: "Gabès", street: "Avenue Habib Thameur", addressDetails: null, ordersOften: 1 },
  { firstName: "Sabrine", lastName: "Ben Mabrouk", phone: "93682750", governorate: "Médenine", city: "Midoun (Djerba)", street: "Route de la plage", addressDetails: null, ordersOften: 1 },
  { firstName: "Lotfi", lastName: "Gharsalli", phone: "21564093", governorate: "Béja", city: "Béja", street: "Rue de Tunis", addressDetails: null, ordersOften: 1 },
  { firstName: "Samia", lastName: "Mrad", phone: "54327816", governorate: "Zaghouan", city: "Zaghouan", street: "Route du Temple des Eaux", addressDetails: null, ordersOften: 1 },
];

/**
 * A crèche that orders gluten-free food for several coeliac children.
 * The admin allowed up to 6 orders a day for this number (EXCEPTION rule below).
 */
export const CRECHE: SeedCustomer = {
  firstName: "Amel",
  lastName: "Ferchichi",
  phone: "71928465",
  governorate: "Tunis",
  city: "Belvédère",
  street: "4, rue d'Alger",
  addressDetails: "Crèche Les Petits Pas — entrée côté jardin",
  ordersOften: 1,
};

/**
 * A number that sent fake orders late at night, each time under another name.
 * The admin cancelled them and blocked the number (BLOCKED rule below).
 */
export const BLOCKED_NUMBER = {
  phone: "27413095",
  names: ["Hédi B.", "Hedi Bel", "Hédi"],
  governorate: "Tunis" as Governorate,
  city: "Tunis",
  streets: ["Avenue de la Liberté", "Rue de Marseille", "Rue Charles de Gaulle"],
};

export const PHONE_RULES: SeedPhoneRule[] = [
  {
    phone: BLOCKED_NUMBER.phone,
    type: "BLOCKED",
    maxPerDay: null,
    reason: "Commandes fictives répétées",
    createdDaysAgo: 20,
    expiresInDays: null,
  },
  {
    phone: CRECHE.phone,
    type: "EXCEPTION",
    maxPerDay: 6,
    reason: "Crèche — commandes groupées",
    createdDaysAgo: 75,
    expiresInDays: 200,
  },
];
