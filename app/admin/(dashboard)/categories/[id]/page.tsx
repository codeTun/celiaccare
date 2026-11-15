import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formKey } from "@/components/admin/catalog/form-key";
import { plural } from "@/components/admin/catalog/list-query";
import { DangerZone, PublicLink, RecordSummary } from "@/components/admin/catalog/record-parts";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { formatDateTime } from "@/lib/format";
import { idSchema } from "@/lib/validators";
import { getCategory, listCategories } from "@/models/fetchers/admin/categories";

import { deleteCategoryAction, updateCategoryAction } from "../actions";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Modifier une catégorie" };

/** /admin/categories/[id] — edit (or delete) a category. */
export default function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier la catégorie"
        description="Les changements sont visibles sur le site dès l'enregistrement."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Catégories", href: "/admin/categories" },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton />}>
        <EditCategory params={params} />
      </Suspense>
    </>
  );
}

async function EditCategory({ params }: Pick<PageProps<"/admin/categories/[id]">, "params">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const [category, categories] = await Promise.all([getCategory(id.data), listCategories()]);
  const row = categories.find((item) => item.id === id.data);
  if (!category || !row) notFound();

  // Icons used by the OTHER categories (one distinct icon per category).
  const usedIcons = Object.fromEntries(
    categories.filter((item) => item.id !== category.id).map((item) => [item.icon, item.name]),
  );

  return (
    <>
      <RecordSummary
        title={category.name}
        subtitle={
          <>
            <span className="font-mono text-xs">{category.slug}</span> · modifiée le {formatDateTime(row.updatedAt)}
          </>
        }
        imageUrl={category.imageUrl}
        imageAlt={`Photo de la catégorie ${category.name}`}
        fallbackIcon={category.icon}
        badges={
          <>
            <Badge tone={row.productCount > 0 ? "brand" : "neutral"}>{plural(row.productCount, "produit")}</Badge>
            {row.productCount > row.activeProductCount ? (
              <Badge tone="neutral">{row.productCount - row.activeProductCount} masqué(s)</Badge>
            ) : null}
          </>
        }
        actions={<PublicLink href={`/fr/produits?categorie=${encodeURIComponent(category.slug)}`} />}
      />

      <CategoryForm
        key={formKey(category)}
        action={updateCategoryAction.bind(null, category.id)}
        category={category}
        usedIcons={usedIcons}
        cloudinaryReady={isCloudinaryConfigured()}
        submitLabel="Enregistrer les modifications"
      />

      <DangerZone
        title="Supprimer la catégorie"
        description={
          row.productCount > 0 ? (
            <>
              Impossible tant qu&apos;elle contient des produits ({plural(row.productCount, "produit")}).{" "}
              <Link href={`/admin/produits?category=${category.id}`} className="font-semibold text-brand-700 hover:underline">
                Voir ces produits
              </Link>{" "}
              et changez leur catégorie, ou supprimez-les.
            </>
          ) : (
            "La catégorie disparaît du menu et des filtres du site. Cette action est définitive."
          )
        }
      >
        {row.productCount === 0 ? (
          <ConfirmDeleteButton
            action={deleteCategoryAction.bind(null, category.id)}
            label="Supprimer la catégorie"
            title={`Supprimer la catégorie « ${category.name} » ?`}
            description="Elle disparaît du menu et des filtres du site. Cette action est définitive."
          />
        ) : null}
      </DangerZone>
    </>
  );
}
