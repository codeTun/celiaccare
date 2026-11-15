import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { toDateInputValue } from "@/components/admin/date-field";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

import { createProducerAction } from "../actions";
import { ProducerForm } from "../producer-form";

export const metadata: Metadata = { title: "Nouvel artisan" };

/** /admin/artisans/nouveau — add a small business. */
export default function NewProducerPage() {
  return (
    <>
      <AdminPageHeader
        title="Nouvel artisan"
        description="Remplissez la fiche après avoir vérifié les informations (visite, appel…) : la source et la date sont obligatoires."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Artisans", href: "/admin/artisans" },
          { label: "Nouvel artisan" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton summary={false} />}>
        <NewProducer />
      </Suspense>
    </>
  );
}

async function NewProducer() {
  await requireAdmin();
  const today = toDateInputValue(new Date()); // request time, after the session check
  return (
    <ProducerForm
      action={createProducerAction}
      today={today}
      cloudinaryReady={isCloudinaryConfigured()}
      submitLabel="Créer la fiche"
    />
  );
}
