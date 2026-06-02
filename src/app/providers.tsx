"use client";

import { CartProvider } from "@/lib/cart-context";
import { products } from "@/lib/products";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <CartProvider products={products}>{children}</CartProvider>;
}
