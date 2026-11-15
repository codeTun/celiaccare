import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DELIVERERS_PATH } from "@/components/admin/delivery/delivery-routes";
import { DelivererForm } from "@/components/admin/delivery/deliverer-form";
import { FormSection } from "@/components/admin/form-section";
import { FormSkeleton } from "@/components/admin/orders/skeletons";
import { requireAdmin } from "@/lib/auth/session";
import { idSchema } from "@/lib/validators";
import { getDeliverer, listDeliverers } from "@/models/fetchers/admin/deliverers";

import { deleteDelivererAction, updateDelivererAction } from "../actions";

export const metadata: Metadata = { title: "Modifier un livreur" };

/** /admin/livraisons/livreurs/[id] — edit a delivery person, or delete them. */
export default function EditDelivererPage({ params }: PageProps<"/admin/livraisons/livreurs/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier le livreur"
        description="Coordonnées, véhicule, zone couverte et disponibilité."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Livraisons", href: "/admin/livraisons" },
          { label: "Livreurs", href: DELIVERERS_PATH },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<FormSkeleton fields={6} />}>
        <EditDelivererForm params={params} />
      </Suspense>
    </>
  );
}

async function EditDelivererForm({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const delivererId = idSchema.safeParse((await params).id);
  if (!delivererId.success) notFound();

  const [deliverer, all] = await Promise.all([getDeliverer(delivererId.data), listDeliverers()]);
  if (!deliverer) notFound();
  const stats = all.find((row) => row.id === deliverer.id);
  const activeOrders = stats?.activeOrderCount ?? 0;
  const delivered = stats?.deliveredCount ?? 0;

  return (
    <div className="space-y-6">
      <DelivererForm action={updateDelivererAction.bind(null, deliverer.id)} deliverer={deliverer} />
      <FormSection
        title="Supprimer le livreur"
        description={`${delivered} commande(s) livrée(s), ${activeOrders} en cours. Ses commandes restent dans l'historique, sans livreur.`}
        actions={
          <ConfirmDeleteButton
            action={deleteDelivererAction.bind(null, deliverer.id)}
            label="Supprimer le livreur"
            title={`Supprimer ${deliverer.name} ?`}
            description="Impossible tant qu'une de ses commandes est en livraison. Pour une pause, désactivez-le plutôt. Cette action est définitive."
          />
        }
      >
        <p className="text-sm text-ink-muted">
          Ses commandes en cours :{" "}
          <Link href="/admin/livraisons" className="font-semibold text-brand-700 hover:underline">
            voir les livraisons en cours
          </Link>
          .
        </p>
      </FormSection>
    </div>
  );
}
