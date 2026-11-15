"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import type { CartItem, CartState, ItemKind } from "@/types";

/**
 * The shopping cart lives in the browser (localStorage), so visitors can order
 * without an account. Prices here are for display only: the server always
 * recomputes them from the database when the order is placed.
 *
 * Rule: one cart = either products from our small businesses (SHOP)
 *       or dishes from ONE partner restaurant (RESTAURANT).
 *
 * How it works: a tiny "store" outside React keeps the cart and tells React
 * when it changes (useSyncExternalStore). The server always renders an empty
 * cart; the saved cart appears right after the page loads.
 */

const STORAGE_KEY = "celiaccare.cart.v1";
export const MAX_QUANTITY = 20;

const EMPTY_CART: CartState = { type: null, restaurantId: null, restaurantName: null, restaurantSlug: null, items: [] };

export type AddToCartInput = {
  kind: ItemKind;
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  merchantName: string;
  href: string | null;
  quantity?: number;
  /** Required for dishes: the restaurant they come from */
  restaurant?: { id: number; name: string; slug: string } | null;
};

export type AddResult = { ok: true } | { ok: false; reason: "OTHER_MERCHANT"; currentMerchant: string };

type CartContextValue = {
  cart: CartState;
  /** false until the saved cart has been read from localStorage */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (input: AddToCartInput) => AddResult;
  /** Empty the cart, then add (used after the "other merchant" confirmation) */
  replaceWith: (input: AddToCartInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const cartKey = (kind: ItemKind, id: number) => `${kind}:${id}`;

/* -------------------------------------------------------------------------- */
/*  The store (outside React)                                                  */
/* -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();
let current: CartState | null = null; // last value read from / written to localStorage

function isValidCart(value: unknown): value is CartState {
  if (!value || typeof value !== "object") return false;
  const cart = value as CartState;
  return Array.isArray(cart.items) && cart.items.every((i) => typeof i?.id === "number" && typeof i?.quantity === "number");
}

function readStorage(): CartState {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    return isValidCart(saved) ? saved : EMPTY_CART;
  } catch {
    return EMPTY_CART; // corrupted or blocked storage: start with an empty cart
  }
}

/** The cart as React sees it (same object until it changes, as useSyncExternalStore requires). */
function getSnapshot(): CartState {
  current ??= readStorage();
  return current;
}

/** What the server renders: always the empty cart. */
function getServerSnapshot(): CartState {
  return EMPTY_CART;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changed the cart: re-read it.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = readStorage();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function save(next: CartState) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full or disabled: the cart still works for this visit
  }
  listeners.forEach((listener) => listener());
}

/* -------------------------------------------------------------------------- */
/*  Pure cart operations                                                       */
/* -------------------------------------------------------------------------- */

function addItem(cart: CartState, input: AddToCartInput): CartState {
  const key = cartKey(input.kind, input.id);
  const quantity = Math.max(1, Math.min(MAX_QUANTITY, input.quantity ?? 1));
  const isDish = input.kind === "DISH";
  const base: CartState =
    cart.items.length === 0
      ? {
          type: isDish ? "RESTAURANT" : "SHOP",
          restaurantId: isDish ? (input.restaurant?.id ?? null) : null,
          restaurantName: isDish ? (input.restaurant?.name ?? null) : null,
          restaurantSlug: isDish ? (input.restaurant?.slug ?? null) : null,
          items: [],
        }
      : cart;
  const alreadyInCart = base.items.some((item) => item.key === key);
  const items: CartItem[] = alreadyInCart
    ? base.items.map((item) =>
        item.key === key ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) } : item,
      )
    : [
        ...base.items,
        {
          key,
          kind: input.kind,
          id: input.id,
          name: input.name,
          price: input.price,
          imageUrl: input.imageUrl,
          merchantName: input.merchantName,
          href: input.href,
          quantity,
        },
      ];
  return { ...base, items };
}

/** Name of the merchant already in the cart when the new item cannot join it, otherwise null. */
function conflictWith(cart: CartState, input: AddToCartInput): string | null {
  if (cart.items.length === 0) return null;
  if (input.kind === "PRODUCT") return cart.type === "SHOP" ? null : (cart.restaurantName ?? "");
  if (cart.type !== "RESTAURANT") return "CeliacCare";
  return cart.restaurantId === input.restaurant?.id ? null : (cart.restaurantName ?? "");
}

function withoutItem(cart: CartState, key: string): CartState {
  const items = cart.items.filter((item) => item.key !== key);
  return items.length ? { ...cart, items } : EMPTY_CART;
}

/* -------------------------------------------------------------------------- */
/*  React provider                                                             */
/* -------------------------------------------------------------------------- */

// true in the browser after hydration, false on the server and during hydration
const subscribeNothing = () => () => {};
const isBrowser = () => true;
const isServer = () => false;

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeNothing, isBrowser, isServer);

  const add = useCallback((input: AddToCartInput): AddResult => {
    const now = getSnapshot();
    const conflict = conflictWith(now, input);
    if (conflict !== null) return { ok: false, reason: "OTHER_MERCHANT", currentMerchant: conflict };
    save(addItem(now, input));
    return { ok: true };
  }, []);

  const replaceWith = useCallback((input: AddToCartInput) => save(addItem(EMPTY_CART, input)), []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    const now = getSnapshot();
    if (quantity <= 0) {
      save(withoutItem(now, key));
      return;
    }
    save({
      ...now,
      items: now.items.map((item) => (item.key === key ? { ...item, quantity: Math.min(MAX_QUANTITY, quantity) } : item)),
    });
  }, []);

  const remove = useCallback((key: string) => save(withoutItem(getSnapshot(), key)), []);

  const clear = useCallback(() => save(EMPTY_CART), []);

  const value = useMemo<CartContextValue>(() => {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return { cart, ready, count, subtotal, add, replaceWith, setQuantity, remove, clear };
  }, [cart, ready, add, replaceWith, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart() must be used inside <CartProvider>.");
  return context;
}
