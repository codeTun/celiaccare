import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DELIVERERS_PATH } from "@/components/admin/delivery/delivery-routes";
import { DelivererForm } from "@/components/admin/delivery/deliverer-form";
import { FormSkeleton } from "@/components/admin/orders/skeletons";
import { requireAdmin } from "@/lib/auth/session";

import { createDelivererAction } from "../actions";

export const metadata: Metadata = { title: "Nouveau livreur" };

/** /admin/livraisons/livreurs/nouveau — add a delivery person. */
export default function NewDelivererPage() {
  return (
    <>
      <AdminPageHeader
        title="Nouveau livreur"
        description="Ajoutez une personne qui livre les commandes : vous pourrez ensuite lui assigner des commandes."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Livraisons", href: "/admin/livraisons" },
          { label: "Livreurs", href: DELIVERERS_PATH },
          { label: "Nouveau livreur" },
        ]}
      />
      <Suspense fallback={<FormSkeleton fields={6} />}>
        <NewDelivererForm />
      </Suspense>
    </>
  );
}

async function NewDelivererForm() {
  await requireAdmin();
  return <DelivererForm action={createDelivererAction} />;
}
