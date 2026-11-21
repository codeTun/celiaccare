import { connection } from "next/server";

import { getDeliveryZones } from "@/models/fetchers/delivery";

/**
 * GET /api/delivery-zones — governorates where the shop delivers and the announced delay.
 * Delivery is free everywhere. Same data as the checkout page.
 */
export async function GET() {
  // Answer at request time, so an admin change (updateTag "zones") shows up immediately.
  await connection();
  return Response.json(await getDeliveryZones());
}
