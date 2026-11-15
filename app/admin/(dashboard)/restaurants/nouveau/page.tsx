import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFormSkeleton } from "@/components/admin/community/skeletons";
import { toDateInputValue } from "@/components/admin/date-field";
import { RestaurantForm } from "@/components/admin/restaurants/restaurant-form";
import { requireAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

import { createRestaurantAction } from "../actions";

export const metadata: Metadata = { title: "Nouveau restaurant" };

/** /admin/restaurants/nouveau — add a restaurant (its menu is added afterwards). */
export default function NewRestaurantPage() {
  return (
    <>
      <AdminPageHeader
        title="Nouveau restaurant"
        description="Renseignez la fiche du restaurant. Vous pourrez ajouter les plats de son menu juste après."
        breadcrumbs={[
          { label: "Tableau de bord", href: "/admin" },
          { label: "Restaurants", href: "/admin/restaurants" },
          { label: "Nouveau" },
        ]}
      />
      <Suspense fallback={<AdminFormSkeleton sections={4} aside />}>
        <NewRestaurantForm />
      </Suspense>
    </>
  );
}

async function NewRestaurantForm() {
  await requireAdmin();
  return (
    <RestaurantForm
      action={createRestaurantAction}
      restaurant={null}
      cloudinaryReady={isCloudinaryConfigured()}
      today={toDateInputValue(new Date())}
    />
  );
}
