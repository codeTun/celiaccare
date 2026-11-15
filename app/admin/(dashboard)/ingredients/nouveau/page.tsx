import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { requireAdmin } from "@/lib/auth/session";

import { createIngredientAction } from "../actions";
import { IngredientForm } from "../ingredient-form";

export const metadata: Metadata = { title: "Nouvel ingrédient" };

/** /admin/ingredients/nouveau — add an ingredient (the list page also has a quick-add card). */
export default function NewIngredientPage() {
  return (
    <>
      <AdminPageHeader
        title="Nouvel ingrédient"
        description="Il pourra ensuite être coché dans la composition des produits et des plats."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Ingrédients", href: "/admin/ingredients" },
          { label: "Nouvel ingrédient" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton summary={false} side={false} />}>
        <NewIngredient />
      </Suspense>
    </>
  );
}

async function NewIngredient() {
  await requireAdmin();
  return <IngredientForm action={createIngredientAction} submitLabel="Ajouter l'ingrédient" />;
}
