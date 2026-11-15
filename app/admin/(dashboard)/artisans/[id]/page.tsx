import { CalendarClock, Eye, EyeOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formKey } from "@/components/admin/catalog/form-key";
import { GuaranteeLevelBadge } from "@/components/admin/catalog/guarantee";
import { PRODUCER_TYPE_ICON_KEYS, PRODUCER_TYPE_LABELS, publicPath } from "@/components/admin/catalog/labels";
import { plural } from "@/components/admin/catalog/list-query";
import { DangerZone, PublicLink, RecordSummary } from "@/components/admin/catalog/record-parts";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { toDateInputValue } from "@/components/admin/date-field";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { formatDate, formatDateTime } from "@/lib/format";
import { idSchema } from "@/lib/validators";
import { getProducer, listProducers } from "@/models/fetchers/admin/producers";

import { deleteProducerAction, updateProducerAction } from "../actions";
import { ProducerForm } from "../producer-form";

export const metadata: Metadata = { title: "Modifier un artisan" };

/** /admin/artisans/[id] — edit (or delete) an artisan's sheet. */
export default function EditProducerPage({ params }: PageProps<"/admin/artisans/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier l'artisan"
        description="Pensez à mettre à jour la source et la date de vérification après chaque contrôle."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Artisans", href: "/admin/artisans" },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton />}>
        <EditProducer params={params} />
      </Suspense>
    </>
  );
}

async function EditProducer({ params }: Pick<PageProps<"/admin/artisans/[id]">, "params">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const [producer, rows] = await Promise.all([getProducer(id.data), listProducers()]);
  const row = rows.find((item) => item.id === id.data);
  if (!producer || !row) notFound();
  const today = toDateInputValue(new Date()); // request time, after the session check

  return (
    <>
      <RecordSummary
        title={producer.name}
        subtitle={`${PRODUCER_TYPE_LABELS[producer.type]} · ${producer.city} (${producer.governorate}) · modifiée le ${formatDateTime(row.updatedAt)}`}
        imageUrl={producer.imageUrl}
        imageAlt={`Photo de ${producer.name}`}
        fallbackIcon={PRODUCER_TYPE_ICON_KEYS[producer.type]}
        badges={
          <>
            {producer.isActive ? (
              <Badge tone="brand">
                <Eye aria-hidden="true" />
                Visible sur le site
              </Badge>
            ) : (
              <Badge tone="neutral">
                <EyeOff aria-hidden="true" />
                Masqué
              </Badge>
            )}
            <GuaranteeLevelBadge level={producer.guaranteeLevel} />
            <Badge tone={row.productCount > 0 ? "brand" : "neutral"}>{plural(row.productCount, "produit")}</Badge>
            {row.needsReview ? (
              <Badge tone="amber" title={`Vérifiée le ${formatDate(row.verifiedAt)}`}>
                <CalendarClock aria-hidden="true" />À revérifier
              </Badge>
            ) : null}
          </>
        }
        actions={
          <>
            {row.productCount > 0 ? (
              <Link href={`/admin/produits?producer=${producer.id}`} className={buttonStyles({ variant: "ghost", size: "sm" })}>
                Voir ses produits
              </Link>
            ) : null}
            {producer.isActive ? <PublicLink href={publicPath("artisans", producer.slug)} /> : null}
          </>
        }
      />

      <ProducerForm
        key={formKey(producer)}
        action={updateProducerAction.bind(null, producer.id)}
        producer={producer}
        today={today}
        cloudinaryReady={isCloudinaryConfigured()}
        submitLabel="Enregistrer les modifications"
      />

      <DangerZone
        title="Supprimer l'artisan"
        description={
          row.productCount > 0 ? (
            <>
              Impossible tant qu&apos;il a des produits ({plural(row.productCount, "produit")}). Pour le retirer du site
              sans rien perdre, décochez « Visible sur le site » ; sinon{" "}
              <Link href={`/admin/produits?producer=${producer.id}`} className="font-semibold text-brand-700 hover:underline">
                supprimez d&apos;abord ses produits
              </Link>
              .
            </>
          ) : (
            "La fiche disparaît du site. Cette action est définitive."
          )
        }
      >
        {row.productCount === 0 ? (
          <ConfirmDeleteButton
            action={deleteProducerAction.bind(null, producer.id)}
            label="Supprimer l'artisan"
            title={`Supprimer l'artisan « ${producer.name} » ?`}
            description="Sa fiche disparaît du site. Cette action est définitive."
          />
        ) : null}
      </DangerZone>
    </>
  );
}
