import { Bike, Car, Motorbike, type LucideIcon } from "lucide-react";

import type { VehicleType } from "@/types";

/* French texts of the delivery people's vehicles (livreurs). */

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  MOTO: "Moto",
  CAR: "Voiture",
  BIKE: "Vélo",
};

export const VEHICLE_ICONS: Record<VehicleType, LucideIcon> = {
  MOTO: Motorbike,
  CAR: Car,
  BIKE: Bike,
};
