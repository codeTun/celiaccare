import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminEmpty } from "@/components/admin/admin-empty";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { toDateInputValue } from "@/components/admin/date-field";
import { buttonStyles } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

import { createProductAction } from "../actions";
import { loadProductFormChoices } from "../form-choices";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Nouveau produit" };

/** /admin/produits/nouveau — add a product. */
export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader
        title="Nouveau produit"
        description="Recopiez les informations de l'étiquette : ingrédients, allergènes, certification éventuelle."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Produits", href: "/admin/produits" },
          { label: "Nouveau produit" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton summary={false} />}>
        <NewProduct />
      </Suspense>
    </>
  );
}

async function NewProduct() {
  await requireAdmin();
  const choices = await loadProductFormChoices();
  const today = toDateInputValue(new Date()); // request time, after the session check

  // A product needs a category and an artisan: say so instead of showing an unusable form.
  const missing = [
    choices.categories.length === 0 ? { href: "/admin/categories/nouveau", label: "Créer une catégorie" } : null,
    choices.producers.length === 0 ? { href: "/admin/artisans/nouveau", label: "Ajouter un artisan" } : null,
  ].filter((item) => item !== null);
  if (missing.length > 0) {
    return (
      <AdminEmpty
        title="Il manque une catégorie ou un artisan"
        description="Chaque produit appartient à une catégorie et à un artisan : créez-les d'abord."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {missing.map((item) => (
              <Link key={item.href} href={item.href} className={buttonStyles()}>
                <Plus aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </div>
        }
      />
    );
  }

  return (
    <ProductForm
      action={createProductAction}
      {...choices}
      today={today}
      cloudinaryReady={isCloudinaryConfigured()}
      submitLabel="Créer le produit"
    />
  );
}
