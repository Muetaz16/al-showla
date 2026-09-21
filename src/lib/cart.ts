// ─────────────────────────────────────────────
//  Cart Store — Global state using localStorage
// ─────────────────────────────────────────────

import { type Product, type Currency } from "./products";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

const CART_KEY = "alshowla_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find((i) => i.product.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((i) => i.product.id !== productId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart().map((i) =>
    i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
  );
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items: CartItem[], currency: Currency): number {
  const rates: Record<Currency, number> = { LYD: 1, USD: 0.21, EUR: 0.19 };
  return items.reduce((sum, i) => sum + i.product.priceBase * i.quantity * rates[currency], 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
