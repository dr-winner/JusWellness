"use client";

import { useState } from "react";
import Image from "next/image";
import { products } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowRight, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const categoryEmoji: Record<string, string> = {
  juice: "🧃",
  coconut: "🥥",
  mashke: "🥤",
  shot: "⚡",
};

export default function FeaturedProducts() {
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const getSize = (productId: string) => selectedSizes[productId] ?? 0;
  const setSize = (productId: string, idx: number) =>
    setSelectedSizes((prev) => ({ ...prev, [productId]: idx }));

  const handleAdd = (product: typeof products[0]) => {
    const sizeIdx = getSize(product.id);
    addToCart(product, sizeIdx);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1200);
  };

  return (
    <section id="products" className="relative py-24 sm:py-32 bg-brand-sand overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-widest uppercase text-brand-green">
              Our Menu
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-brand-green-dark leading-[1.1]">
              What We&apos;re
              <br />
              Pouring Today
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-brand-green font-semibold hover:gap-3 transition-all"
          >
            View all {products.length} products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product grid — show ALL products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => {
            const sizeIdx = getSize(product.id);
            const currentPrice = product.sizes[sizeIdx].price;
            const justAdded = addedIds.has(product.id);

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-brand-green/5 hover:border-brand-green/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <Link href="/shop" className="block relative aspect-square bg-brand-cream overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 px-2.5 py-1 bg-brand-orange text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 text-sm">
                    {categoryEmoji[product.category]}
                  </span>
                </Link>

                {/* Info */}
                <div className="p-3 sm:p-4 space-y-2">
                  <Link href="/shop">
                    <h3 className="font-bold text-sm sm:text-base text-brand-green-dark leading-tight truncate">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
                    {product.ingredients.join(" · ")}
                  </p>

                  {/* Size selector */}
                  {product.sizes.length > 1 && (
                    <div className="flex gap-1.5">
                      {product.sizes.map((size, idx) => (
                        <button
                          key={size.label}
                          onClick={() => setSize(product.id, idx)}
                          className={cn(
                            "px-2 py-1 text-[11px] font-semibold rounded-lg border transition-all duration-200",
                            sizeIdx === idx
                              ? "bg-brand-green-dark text-white border-brand-green-dark"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:border-brand-green/40"
                          )}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Price & Add */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-lg font-bold text-brand-green">
                      {formatCurrency(currentPrice)}
                    </p>
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={!product.inStock}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        justAdded
                          ? "bg-green-500 text-white scale-90"
                          : product.inStock
                            ? "bg-brand-green-dark text-white hover:bg-brand-green hover:scale-105"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {justAdded ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-orange text-white font-bold text-lg rounded-full hover:bg-brand-gold transition-all duration-300 hover:scale-[1.03] shadow-xl shadow-brand-orange/20"
          >
            Order Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
