import "server-only";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/prisma";
import { GOVERNORATES } from "@/lib/tunisia";
import type { DeliveryZoneDTO } from "@/types";

/** Position of each governorate in the official list (lib/tunisia.ts): Tunis, Ariana, Ben Arous... */
const governorateOrder = new Map<string, number>(GOVERNORATES.map((governorate, index) => [governorate.value, index]));

/**
 * Delivery zones of the shop (one per governorate): fee, delay and free-delivery threshold.
 * Only active zones, in the order of the governorates list.
 */
export async function getDeliveryZones(): Promise<DeliveryZoneDTO[]> {
  "use cache";
  cachePolicy([TAGS.zones]);

  const rows = await db.orm.public.DeliveryZone.where((zone) => zone.isActive.eq(true))
    .select("id", "governorate", "fee", "delay", "freeFrom")
    .all();

  const position = (governorate: string) => governorateOrder.get(governorate) ?? GOVERNORATES.length;
  return rows
    .sort((a, b) => position(a.governorate) - position(b.governorate) || a.governorate.localeCompare(b.governorate, "fr"))
    .map((row) => ({
      id: row.id,
      governorate: row.governorate,
      fee: row.fee,
      delay: row.delay,
      freeFrom: row.freeFrom,
    }));
}
