import { TriangleExclamationPoint } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formKey } from "@/components/admin/catalog/form-key";
import { plural } from "@/components/admin/catalog/list-query";
import { DangerZone, RecordSummary } from "@/components/admin/catalog/record-parts";
import { CatalogFormSkeleton } from "@/components/admin/catalog/skeletons";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { idSchema } from "@/lib/validators";
import { getIngredient, listIngredients } from "@/models/fetchers/admin/ingredients";

import { deleteIngredientAction, updateIngredientAction } from "../actions";
import { IngredientForm } from "../ingredient-form";

export const metadata: Metadata = { title: "Modifier un ingrédient" };

/** /admin/ingredients/[id] — edit (or delete) an ingredient. */
export default function EditIngredientPage({ params }: PageProps<"/admin/ingredients/[id]">) {
  return (
    <>
      <AdminPageHeader
        title="Modifier l'ingrédient"
        description="Le nouveau nom apparaît aussitôt dans la composition des produits et des plats qui le contiennent."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Ingrédients", href: "/admin/ingredients" },
          { label: "Modifier" },
        ]}
      />
      <Suspense fallback={<CatalogFormSkeleton side={false} />}>
        <EditIngredient params={params} />
      </Suspense>
    </>
  );
}

async function EditIngredient({ params }: Pick<PageProps<"/admin/ingredients/[id]">, "params">) {
  await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const [ingredient, rows] = await Promise.all([getIngredient(id.data), listIngredients()]);
  const row = rows.find((item) => item.id === id.data);
  if (!ingredient || !row) notFound();
  const used = row.productCount + row.dishCount > 0;

  return (
    <>
      <RecordSummary
        title={ingredient.name}
        subtitle={<span className="font-mono text-xs">{ingredient.slug}</span>}
        badges={
          <>
            {ingredient.isAllergen ? (
              <Badge tone="red">
                <TriangleExclamationPoint aria-hidden="true" />
                Allergène
              </Badge>
            ) : null}
            <Badge tone={row.productCount > 0 ? "brand" : "neutral"}>{plural(row.productCount, "produit")}</Badge>
            <Badge tone={row.dishCount > 0 ? "brand" : "neutral"}>{plural(row.dishCount, "plat")}</Badge>
          </>
        }
        actions={
          row.productCount > 0 ? (
            <Link
              href={`/admin/produits?q=${encodeURIComponent(ingredient.name)}`}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              Voir les produits
            </Link>
          ) : null
        }
      />

      <IngredientForm
        key={formKey(ingredient)}
        action={updateIngredientAction.bind(null, ingredient.id)}
        ingredient={ingredient}
        submitLabel="Enregistrer les modifications"
      />

      <DangerZone
        title="Supprimer l'ingrédient"
        description={
          used
            ? `Il sera retiré de la composition de ${plural(row.productCount, "produit")} et ${plural(row.dishCount, "plat")}. Vérifiez ensuite ces fiches.`
            : "Il n'est utilisé dans aucun produit ni plat. Cette action est définitive."
        }
      >
        <ConfirmDeleteButton
          action={deleteIngredientAction.bind(null, ingredient.id)}
          label="Supprimer l'ingrédient"
          title={`Supprimer l'ingrédient « ${ingredient.name} » ?`}
          description={
            used
              ? `Il sera retiré de ${plural(row.productCount, "produit")} et ${plural(row.dishCount, "plat")}. Cette action est définitive.`
              : "Cette action est définitive."
          }
        />
      </DangerZone>
    </>
  );
}
