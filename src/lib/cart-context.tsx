"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Product, CartItem } from "./types";

export type SubscriptionFrequency = "weekly" | "monthly" | null;

export interface SubscriptionCartItem extends CartItem {
  subscription: SubscriptionFrequency;
}

interface CartContextType {
  cart: SubscriptionCartItem[];
  addToCart: (
    product: Product,
    sizeIndex: number,
    subscription?: SubscriptionFrequency
  ) => void;
  updateQuantity: (
    productId: string,
    sizeIndex: number,
    delta: number
  ) => void;
  toggleSubscription: (
    productId: string,
    sizeIndex: number,
    frequency: SubscriptionFrequency
  ) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  orderTotal: number;
  subscriptionSavings: number;
  hasSubscriptions: boolean;
  hydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "jus-wellness-cart";
const SUBSCRIPTION_DISCOUNT = 0.05; // 5%

function serializeCart(cart: SubscriptionCartItem[]): string {
  return JSON.stringify(
    cart.map((item) => ({
      productId: item.product.id,
      sizeIndex: item.sizeIndex,
      quantity: item.quantity,
      subscription: item.subscription,
    }))
  );
}

function deserializeCart(
  raw: string,
  products: Product[]
): SubscriptionCartItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      productId: string;
      sizeIndex: number;
      quantity: number;
      subscription?: SubscriptionFrequency;
    }[];
    return parsed
      .map((entry) => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product) return null;
        return {
          product,
          sizeIndex: entry.sizeIndex,
          quantity: entry.quantity,
          subscription: entry.subscription || null,
        };
      })
      .filter(Boolean) as SubscriptionCartItem[];
  } catch {
    return [];
  }
}

/**
 * Calculate the effective price for an item (with subscription discount if applicable).
 */
export function getItemPrice(item: SubscriptionCartItem): number {
  const basePrice = item.product.sizes[item.sizeIndex].price;
  if (item.subscription) {
    return basePrice * (1 - SUBSCRIPTION_DISCOUNT);
  }
  return basePrice;
}

/**
 * Calculate the item line total.
 */
export function getItemTotal(item: SubscriptionCartItem): number {
  return getItemPrice(item) * item.quantity;
}

export function CartProvider({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const [cart, setCart] = useState<SubscriptionCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCart(deserializeCart(stored, products));
      }
      setHydrated(true);
    });
  }, [products]);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, serializeCart(cart));
    }
  }, [cart, hydrated]);

  const addToCart = useCallback(
    (
      product: Product,
      sizeIndex: number,
      subscription: SubscriptionFrequency = null
    ) => {
      setCart((prev) => {
        const existing = prev.find(
          (item) =>
            item.product.id === product.id &&
            item.sizeIndex === sizeIndex &&
            item.subscription === subscription
        );
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id &&
            item.sizeIndex === sizeIndex &&
            item.subscription === subscription
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, sizeIndex, quantity: 1, subscription }];
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, sizeIndex: number, delta: number) => {
      setCart((prev) =>
        prev
          .map((item) =>
            item.product.id === productId && item.sizeIndex === sizeIndex
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const toggleSubscription = useCallback(
    (
      productId: string,
      sizeIndex: number,
      frequency: SubscriptionFrequency
    ) => {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId && item.sizeIndex === sizeIndex
            ? {
                ...item,
                subscription:
                  item.subscription === frequency ? null : frequency,
              }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart total with subscription discounts applied
  const cartTotal = cart.reduce((sum, item) => sum + getItemTotal(item), 0);

  // How much the customer saves from subscriptions
  const subscriptionSavings = cart.reduce((sum, item) => {
    if (!item.subscription) return sum;
    const baseTotal =
      item.product.sizes[item.sizeIndex].price * item.quantity;
    return sum + baseTotal * SUBSCRIPTION_DISCOUNT;
  }, 0);

  const hasSubscriptions = cart.some((item) => item.subscription !== null);

  const orderTotal = cartTotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        toggleSubscription,
        clearCart,
        cartCount,
        cartTotal,
        orderTotal,
        subscriptionSavings,
        hasSubscriptions,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
