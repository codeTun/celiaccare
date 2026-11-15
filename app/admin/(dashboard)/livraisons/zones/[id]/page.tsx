import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ZONES_PATH } from "@/components/admin/delivery/delivery-routes";
import { DeliveryZoneForm } from "@/components/admin/delivery/delivery-zone-form";
import { FormSection } from "@/components/admin/form-section";
import { FormSkeleton } from "@/components/admin/orders/skeletons";
import { requireAdmin } from "@/lib/auth/session";
import { GOVERNORATES } from "@/lib/tunisia";
import { idSchema } from "@/lib/validators";
import { getDeliveryZone, listDeliveryZones } from "@/models/fetchers/admin/delivery-zones";

import { deleteDeliveryZoneAction, updateDeliveryZoneAction } from "../actions";

export const metadata: Metadata = { title: "Modifier une zone de livraison" };

/** /admin/livraisons/zones/[id] — change the fee, delay or free-delivery threshold of a zone, or delete it. */
export default function EditDeliveryZonePage({ params }: PageProps<"/admin/livraisons/zones/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier la zone de livraison"
        description="Les nouveaux frais et délais s'appliquent aux prochaines commandes ; les commandes passées gardent les leurs."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Livraisons", href: "/admin/livraisons" },
          { label: "Zones", href: ZONES_PATH },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<FormSkeleton fields={5} />}>
        <EditZoneForm params={params} />
      </Suspense>
    </>
  );
}

async function EditZoneForm({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const zoneId = idSchema.safeParse((await params).id);
  if (!zoneId.success) notFound();

  const [zone, zones] = await Promise.all([getDeliveryZone(zoneId.data), listDeliveryZones()]);
  if (!zone) notFound();
  const takenByOthers = new Set(zones.filter((other) => other.id !== zone.id).map((other) => other.governorate));
  const choices = GOVERNORATES.map((g) => g.value).filter((governorate) => !takenByOthers.has(governorate));
  const orderCount = zones.find((row) => row.id === zone.id)?.orderCount ?? 0;

  return (
    <div className="space-y-6">
      <DeliveryZoneForm action={updateDeliveryZoneAction.bind(null, zone.id)} zone={zone} governorates={choices} />
      <FormSection
        title="Supprimer la zone"
        description={
          orderCount > 0
            ? `${orderCount} commande(s) ont été livrées dans cette zone : elles gardent leurs montants. Pour suspendre la livraison, fermez plutôt la zone.`
            : "Les clients de ce gouvernorat ne pourront plus commander."
        }
        actions={
          <ConfirmDeleteButton
            action={deleteDeliveryZoneAction.bind(null, zone.id)}
            label="Supprimer la zone"
            title={`Supprimer la zone « ${zone.governorate} » ?`}
            description="La livraison ne sera plus proposée dans ce gouvernorat. Cette action est définitive."
          />
        }
      >
        <p className="text-sm text-ink-muted">
          Astuce : désactivez « Livraison ouverte » ci-dessus pour une pause temporaire (vacances, grève…).
        </p>
      </FormSection>
    </div>
  );
}
