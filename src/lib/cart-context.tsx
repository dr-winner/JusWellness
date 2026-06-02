"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Product, CartItem } from "./types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, sizeIndex: number) => void;
  updateQuantity: (productId: string, sizeIndex: number, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  deliveryFee: number;
  orderTotal: number;
  hydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "jus-wellness-cart";

function serializeCart(cart: CartItem[]): string {
  return JSON.stringify(
    cart.map((item) => ({
      productId: item.product.id,
      sizeIndex: item.sizeIndex,
      quantity: item.quantity,
    }))
  );
}

function deserializeCart(
  raw: string,
  products: Product[]
): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      productId: string;
      sizeIndex: number;
      quantity: number;
    }[];
    return parsed
      .map((entry) => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product) return null;
        return { product, sizeIndex: entry.sizeIndex, quantity: entry.quantity };
      })
      .filter(Boolean) as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
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

  const addToCart = useCallback((product: Product, sizeIndex: number) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.sizeIndex === sizeIndex
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.sizeIndex === sizeIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, sizeIndex, quantity: 1 }];
    });
  }, []);

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

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.sizes[item.sizeIndex].price * item.quantity,
    0
  );
  const deliveryFee = cartTotal >= 100 ? 0 : 10;
  const orderTotal = cartTotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        deliveryFee,
        orderTotal,
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
