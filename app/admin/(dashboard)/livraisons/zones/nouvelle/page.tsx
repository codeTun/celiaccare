import { MapPinned } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ZONES_PATH } from "@/components/admin/delivery/delivery-routes";
import { DeliveryZoneForm } from "@/components/admin/delivery/delivery-zone-form";
import { FormSkeleton } from "@/components/admin/orders/skeletons";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { GOVERNORATES } from "@/lib/tunisia";
import { listDeliveryZones } from "@/models/fetchers/admin/delivery-zones";

import { createDeliveryZoneAction } from "../actions";

export const metadata: Metadata = { title: "Nouvelle zone de livraison" };

/** /admin/livraisons/zones/nouvelle — open the delivery to one more governorate. */
export default function NewDeliveryZonePage() {
  return (
    <>
      <AdminPageHeader
        title="Nouvelle zone de livraison"
        description="Ouvrez la livraison (gratuite pour le client) dans un gouvernorat et indiquez le délai annoncé. Les clients de ce gouvernorat pourront commander dès que la zone est ouverte."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Livraisons", href: "/admin/livraisons" },
          { label: "Zones", href: ZONES_PATH },
          { label: "Nouvelle zone" },
        ]}
      />
      <Suspense fallback={<FormSkeleton fields={5} />}>
        <NewZoneForm />
      </Suspense>
    </>
  );
}

async function NewZoneForm() {
  await requireAdmin();
  const zones = await listDeliveryZones();
  const covered = new Set(zones.map((zone) => zone.governorate));
  const available = GOVERNORATES.map((g) => g.value).filter((governorate) => !covered.has(governorate));

  if (available.length === 0) {
    return (
      <AdminEmpty
        icon={<MapPinned />}
        title="Les 24 gouvernorats ont déjà une zone"
        description="Modifiez une zone existante pour changer son délai, ou ouvrez une zone fermée."
        action={
          <Link href={ZONES_PATH} className={buttonStyles({ variant: "outline" })}>
            Voir les zones
          </Link>
        }
      />
    );
  }
  return <DeliveryZoneForm action={createDeliveryZoneAction} governorates={available} />;
}
