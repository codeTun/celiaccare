/**
 * Delivery set-up (demo data): one delivery zone per governorate and the delivery people.
 *
 * Zones (unique key: `governorate`, one line for each of the 24 governorates of lib/tunisia.ts):
 * - `fee` and `freeFrom` are in MILLIMES (7000 = 7,000 DT; free delivery from 150,000 DT).
 * - `isActive: false` = not covered yet: the site shows "zone pas encore couverte" (spec EF-05).
 *
 * Delivery people (unique key: `phone`, FICTIONAL people and numbers):
 * - `covers` lists the governorates they deliver to; it is saved as the "zone" text
 *   and used to assign them to the demo orders.
 */
import type { Governorate } from "../../lib/tunisia";
import type { VehicleType } from "../../types/enums";

export type SeedDeliveryZone = {
  governorate: Governorate;
  fee: number;
  delay: string;
  freeFrom: number | null;
  isActive: boolean;
};

export type SeedDeliverer = {
  name: string;
  phone: string;
  vehicle: VehicleType;
  covers: Governorate[];
  notes: string | null;
};

const FREE_FROM = 150_000; // 150,000 DT

export const DELIVERY_ZONES: SeedDeliveryZone[] = [
  // Grand Tunis: next day
  { governorate: "Tunis", fee: 7000, delay: "24 h", freeFrom: FREE_FROM, isActive: true },
  { governorate: "Ariana", fee: 7000, delay: "24 h", freeFrom: FREE_FROM, isActive: true },
  { governorate: "Ben Arous", fee: 7000, delay: "24 h", freeFrom: FREE_FROM, isActive: true },
  { governorate: "Manouba", fee: 7000, delay: "24 h", freeFrom: FREE_FROM, isActive: true },
  // Cap Bon, Bizerte, Zaghouan and the Sahel
  { governorate: "Nabeul", fee: 8000, delay: "24–48 h", freeFrom: null, isActive: true },
  { governorate: "Zaghouan", fee: 8000, delay: "24–48 h", freeFrom: null, isActive: true },
  { governorate: "Bizerte", fee: 8000, delay: "24–48 h", freeFrom: null, isActive: true },
  { governorate: "Sousse", fee: 8000, delay: "24–48 h", freeFrom: FREE_FROM, isActive: true },
  { governorate: "Monastir", fee: 8000, delay: "24–48 h", freeFrom: null, isActive: true },
  { governorate: "Mahdia", fee: 8000, delay: "24–48 h", freeFrom: null, isActive: true },
  // Sfax and Kairouan
  { governorate: "Sfax", fee: 9000, delay: "48 h", freeFrom: null, isActive: true },
  { governorate: "Kairouan", fee: 9000, delay: "48 h", freeFrom: null, isActive: true },
  // North-west, centre-west and south
  { governorate: "Béja", fee: 10000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Jendouba", fee: 11000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Le Kef", fee: 11000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Siliana", fee: 11000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Kasserine", fee: 11000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Sidi Bouzid", fee: 10000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Gafsa", fee: 11000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Gabès", fee: 10000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Médenine", fee: 11000, delay: "48–72 h", freeFrom: null, isActive: true },
  { governorate: "Tozeur", fee: 12000, delay: "48–72 h", freeFrom: null, isActive: true },
  // Not covered yet (spec EF-05: "zone pas encore couverte")
  { governorate: "Kébili", fee: 12000, delay: "48–72 h", freeFrom: null, isActive: false },
  { governorate: "Tataouine", fee: 12000, delay: "48–72 h", freeFrom: null, isActive: false },
];

export const DELIVERERS: SeedDeliverer[] = [
  {
    name: "Karim Ben Salah",
    phone: "98412736",
    vehicle: "MOTO",
    covers: ["Tunis", "Ariana"],
    notes: "Disponible 7 j/7, livre aussi les commandes des restaurants partenaires.",
  },
  {
    name: "Sami Mejri",
    phone: "22947351",
    vehicle: "MOTO",
    covers: ["Ben Arous", "Manouba"],
    notes: null,
  },
  {
    name: "Yassine Mahjoub",
    phone: "55203648",
    vehicle: "BIKE",
    covers: ["Tunis"],
    notes: "Vélo électrique : centre-ville, Lafayette, Mutuelleville et médina.",
  },
  {
    name: "Hatem Gharbi",
    phone: "97350842",
    vehicle: "CAR",
    covers: ["Nabeul", "Bizerte", "Zaghouan"],
    notes: "Tournées Cap Bon le lundi et le jeudi.",
  },
  {
    name: "Walid Chaabane",
    phone: "29586014",
    vehicle: "CAR",
    covers: ["Sousse", "Monastir", "Mahdia", "Kairouan"],
    notes: null,
  },
  {
    name: "Anis Rekik",
    phone: "50738291",
    vehicle: "CAR",
    covers: ["Sfax", "Gabès", "Médenine", "Gafsa", "Tozeur", "Béja", "Jendouba", "Le Kef", "Siliana", "Kasserine", "Sidi Bouzid"],
    notes: "Longues distances : départs groupés depuis Tunis et Sfax deux fois par semaine.",
  },
];
