import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { listCategories } from "@/models/fetchers/admin/categories";

import { createCategoryAction } from "../actions";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Nouvelle catégorie" };

/** /admin/categories/nouveau — create a category. */
export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader
        title="Nouvelle catégorie"
        description="Un nouveau rayon du catalogue. Il apparaît sur le site dès qu'il contient des produits en ligne."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Catégories", href: "/admin/categories" },
          { label: "Nouvelle catégorie" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton summary={false} />}>
        <NewCategory />
      </Suspense>
    </>
  );
}

async function NewCategory() {
  await requireAdmin();
  const categories = await listCategories();
  const usedIcons = Object.fromEntries(categories.map((category) => [category.icon, category.name]));
  const nextSortOrder = categories.reduce((max, category) => Math.max(max, category.sortOrder), 0) + 1;

  return (
    <CategoryForm
      action={createCategoryAction}
      usedIcons={usedIcons}
      nextSortOrder={nextSortOrder}
      cloudinaryReady={isCloudinaryConfigured()}
      submitLabel="Créer la catégorie"
    />
  );
}
