import "server-only";

import { db } from "@/lib/prisma";
import { DISH_COURSES, type DishCourse } from "@/types";
import type { AdminDishForm, AdminDishRow } from "@/types/admin-data";

import { isValidId } from "./helpers";

/**
 * ADMIN — dishes of a restaurant menu (never cached).
 * Call requireAdmin() before using these functions.
 */

/** A dish of the menu page: the shared row + the names of its allergens (milk, eggs, nuts...). */
export type AdminMenuDishRow = AdminDishRow & {
  allergenNames: string[];
};

/** The menu of one restaurant: starters, mains, desserts, drinks — then by sortOrder and name. */
export async function listDishes(restaurantId: number): Promise<AdminMenuDishRow[]> {
  if (!isValidId(restaurantId)) return [];
  const rows = await db.orm.public.Dish.select("id", "name", "nameAr", "price", "imageUrl", "course", "isAvailable", "sortOrder")
    .where({ restaurantId })
    .include("ingredients", (ingredients) => ingredients.select("name", "isAllergen").orderBy((i) => i.name.asc()))
    .orderBy([(d) => d.sortOrder.asc(), (d) => d.name.asc(), (d) => d.id.asc()])
    .all();

  // Courses are stored as text ("MAIN"...): sort them in menu order, not alphabetically.
  const courseOrder = (course: DishCourse) => DISH_COURSES.indexOf(course);
  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      nameAr: row.nameAr,
      price: row.price,
      imageUrl: row.imageUrl,
      course: row.course,
      isAvailable: row.isAvailable,
      sortOrder: row.sortOrder,
      ingredientNames: row.ingredients.map((ingredient) => ingredient.name),
      allergenNames: row.ingredients.filter((ingredient) => ingredient.isAllergen).map((ingredient) => ingredient.name),
    }))
    .sort((a, b) => courseOrder(a.course) - courseOrder(b.course));
}

/** One dish with the ids of its ingredients, to pre-fill the edit form. null when it does not exist. */
export async function getDish(id: number): Promise<AdminDishForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Dish.where({ id })
    .include("ingredients", (ingredients) => ingredients.select("id").orderBy((i) => i.id.asc()))
    .include("restaurant", (restaurant) => restaurant.select("name"))
    .first();
  if (!row) return null;
  return {
    id: row.id,
    restaurantId: row.restaurantId,
    restaurantName: row.restaurant?.name ?? "",
    name: row.name,
    nameAr: row.nameAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    price: row.price,
    imageUrl: row.imageUrl,
    course: row.course,
    isAvailable: row.isAvailable,
    sortOrder: row.sortOrder,
    ingredientIds: row.ingredients.map((ingredient) => ingredient.id),
  };
}
