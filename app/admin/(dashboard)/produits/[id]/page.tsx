import { CalendarClock, Eye, EyeOff, PackageX, Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formKey } from "@/components/admin/catalog/form-key";
import { GuaranteeLevelBadge } from "@/components/admin/catalog/guarantee";
import { publicPath } from "@/components/admin/catalog/labels";
import { DangerZone, PublicLink, RecordSummary } from "@/components/admin/catalog/record-parts";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { toDateInputValue } from "@/components/admin/date-field";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/format";
import { needsReview } from "@/lib/utils";
import { idSchema } from "@/lib/validators";
import { getProduct } from "@/models/fetchers/admin/products";

import { deleteProductAction, updateProductAction } from "../actions";
import { loadProductFormChoices } from "../form-choices";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Modifier un produit" };

/** /admin/produits/[id] — edit (or delete) a product, with a link to its public page. */
export default function EditProductPage({ params }: PageProps<"/admin/produits/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier le produit"
        description="Les changements sont visibles sur le site dès l'enregistrement. Mettez à jour la date de vérification après chaque contrôle de l'étiquette."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Produits", href: "/admin/produits" },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton />}>
        <EditProduct params={params} />
      </Suspense>
    </>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/admin/produits/[id]">, "params">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const [product, choices] = await Promise.all([getProduct(id.data), loadProductFormChoices()]);
  if (!product) notFound();

  const now = new Date(); // request time, after the session check
  const today = toDateInputValue(now);
  const category = choices.categories.find((item) => item.id === product.categoryId);
  const producer = choices.producers.find((item) => item.id === product.producerId);

  return (
    <>
      <RecordSummary
        title={product.name}
        subtitle={[formatPrice(product.price), product.unit, category?.name, producer?.name].filter(Boolean).join(" · ")}
        imageUrl={product.imageUrl}
        imageAlt={`Photo de ${product.name}`}
        fallbackIcon={category?.icon}
        badges={
          <>
            {product.isActive ? (
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
            {product.isFeatured ? (
              <Badge tone="saffron">
                <Star className="fill-current" aria-hidden="true" />
                En vedette
              </Badge>
            ) : null}
            {product.isAvailable ? null : (
              <Badge tone="amber">
                <PackageX aria-hidden="true" />
                Indisponible
              </Badge>
            )}
            <GuaranteeLevelBadge level={product.guaranteeLevel} />
            {needsReview(`${product.verifiedAt}T12:00:00Z`, now) ? (
              <Badge tone="amber">
                <CalendarClock aria-hidden="true" />À revérifier
              </Badge>
            ) : null}
          </>
        }
        actions={
          product.isActive && producer?.isActive ? (
            <PublicLink href={publicPath("produits", product.slug)} />
          ) : (
            <span className="text-xs text-ink-subtle">
              {product.isActive ? "Non visible : l'artisan est masqué" : "Non visible sur le site"}
            </span>
          )
        }
      />

      <ProductForm
        key={formKey(product)}
        action={updateProductAction.bind(null, product.id)}
        product={product}
        {...choices}
        today={today}
        cloudinaryReady={isCloudinaryConfigured()}
        submitLabel="Enregistrer les modifications"
      />

      <DangerZone
        title="Supprimer le produit"
        description="La fiche et ses avis disparaissent du site ; les commandes passées gardent leur ligne (nom et prix copiés). Pour un retrait temporaire, décochez plutôt « Visible sur le site »."
      >
        <ConfirmDeleteButton
          action={deleteProductAction.bind(null, product.id)}
          label="Supprimer le produit"
          title={`Supprimer « ${product.name} » ?`}
          description="La fiche, sa photo et ses avis sont supprimés. Cette action est définitive."
        />
      </DangerZone>
    </>
  );
}
