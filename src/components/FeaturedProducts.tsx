"use client";

import { useState } from "react";
import Image from "next/image";
import { products } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowRight, ShoppingBag, Check, Eye, X, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/types";

const categoryEmoji: Record<string, string> = {
  juice: "🧃",
  coconut: "🥥",
  mashke: "🥤",
  shot: "⚡",
};

const featuredProducts = products
  .filter((product) => product.badge)
  .slice(0, 8);

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
};

export default function FeaturedProducts() {
  const { addToCart, cart, updateQuantity } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const getSize = (productId: string) => selectedSizes[productId] ?? 0;
  const setSize = (productId: string, idx: number) =>
    setSelectedSizes((prev) => ({ ...prev, [productId]: idx }));

  const handleAdd = (product: Product, sizeIdx: number) => {
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

  const handleAddFromCard = (product: Product) => {
    const sizeIdx = getSize(product.id);
    handleAdd(product, sizeIdx);
  };

  // Check if item is already in cart (for the quick view modal quantity adjustment)
  const getCartItem = (product: Product, sizeIdx: number) => {
    return cart.find((item) => item.product.id === product.id && item.sizeIndex === sizeIdx);
  };

  return (
    <section id="products" className="relative py-24 sm:py-32 bg-brand-sand overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16"
        >
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
        </motion.div>

        {/* Product grid */}
        <motion.div 
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {featuredProducts.map((product, index) => {
            const sizeIdx = getSize(product.id);
            const currentPrice = product.sizes[sizeIdx].price;
            const justAdded = addedIds.has(product.id);

            return (
              <motion.article
                key={product.id}
                variants={cardVariants}
                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-brand-green/5 hover:border-brand-green/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image & Quick View trigger */}
                <button
                  type="button"
                  aria-label={`Quick view ${product.name}`}
                  className="relative aspect-square bg-brand-cream overflow-hidden cursor-pointer block w-full"
                  onClick={() => setQuickViewProduct(product)}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    priority={index < 2}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 px-2.5 py-1 bg-brand-orange text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow z-10">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 text-sm z-10 bg-white/70 backdrop-blur-sm w-7 h-7 rounded-full flex items-center justify-center">
                    {categoryEmoji[product.category]}
                  </span>
                  
                  {/* Quick view button overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="flex items-center gap-1.5 px-4 py-2 bg-white/95 text-brand-green-dark text-xs font-bold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-3.5 h-3.5" />
                      Quick View
                    </span>
                  </div>
                </button>

                {/* Info */}
                <div className="p-3 sm:p-4 space-y-2">
                  <h3 
                    onClick={() => setQuickViewProduct(product)}
                    className="font-bold text-sm sm:text-base text-brand-green-dark leading-tight truncate cursor-pointer hover:text-brand-green transition-colors"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
                    {product.ingredients.join(" · ")}
                  </p>

                  {/* Size selector */}
                  {product.sizes.length > 1 && (
                    <div className="flex gap-1.5 pt-0.5">
                      {product.sizes.map((size, idx) => (
                        <button
                          type="button"
                          key={size.label}
                          onClick={() => setSize(product.id, idx)}
                          aria-pressed={sizeIdx === idx}
                          className={cn(
                            "px-2 py-1 text-[11px] font-semibold rounded-lg border transition-all duration-200",
                            sizeIdx === idx
                              ? "bg-brand-green-dark text-white border-brand-green-dark shadow-sm"
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
                      type="button"
                      onClick={() => handleAddOriginal(product)}
                      disabled={!product.inStock}
                      aria-label={`Add ${product.name} ${product.sizes[sizeIdx].label} to cart`}
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
              </motion.article>
            );
          })}
        </motion.div>

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

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-view-title"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setQuickViewProduct(null)}
                aria-label="Close quick view"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Left Side - Image */}
                <div className="relative aspect-square md:aspect-auto md:h-full bg-brand-cream flex items-center justify-center p-8">
                  <div className="relative w-full h-full min-h-[250px] flex items-center justify-center">
                    <Image
                      src={quickViewProduct.image}
                      alt={quickViewProduct.name}
                      width={400}
                      height={400}
                      className="object-contain p-2 w-auto h-auto max-h-[300px]"
                    />
                  </div>
                  {quickViewProduct.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-brand-orange text-white text-xs font-bold tracking-wider uppercase rounded-full shadow">
                      {quickViewProduct.badge}
                    </span>
                  )}
                </div>

                {/* Right Side - Details */}
                <div className="p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {quickViewProduct.category}
                    </span>

                    <h2 id="quick-view-title" className="text-2xl sm:text-3xl font-bold text-brand-green-dark leading-tight">
                      {quickViewProduct.name}
                    </h2>

                    <p className="text-sm text-gray-500 leading-relaxed">
                      {quickViewProduct.description}
                    </p>

                    {/* Ingredients */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Ingredients
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickViewProduct.ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700 rounded-lg"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    {quickViewProduct.benefits && quickViewProduct.benefits.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                          Benefits
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {quickViewProduct.benefits.map((b) => (
                            <span
                              key={b}
                              className="px-2.5 py-1 bg-brand-gold/10 text-brand-gold text-xs font-bold rounded-lg"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selector */}
                    {quickViewProduct.sizes.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                          Size
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {quickViewProduct.sizes.map((size, idx) => {
                            const modalSizeIdx = getSize(quickViewProduct.id);
                            return (
                              <button
                                type="button"
                                key={size.label}
                                onClick={() => setSize(quickViewProduct.id, idx)}
                                aria-pressed={modalSizeIdx === idx}
                                className={cn(
                                  "px-3 py-1.5 text-xs font-bold rounded-xl border transition-all duration-200",
                                  modalSizeIdx === idx
                                    ? "bg-brand-green-dark text-white border-brand-green-dark shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-green/40"
                                )}
                              >
                                {size.label}
                                <span className="block text-[9px] font-normal mt-0.5 opacity-70">
                                  {formatCurrency(size.price)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 mt-6">
                    <div className="flex-1">
                      <p className="text-2xl font-black text-brand-green-dark">
                        {formatCurrency(quickViewProduct.sizes[getSize(quickViewProduct.id)].price)}
                      </p>
                    </div>

                    {(() => {
                      const modalSizeIdx = getSize(quickViewProduct.id);
                      const inCart = getCartItem(quickViewProduct, modalSizeIdx);
                      const justAdded = addedIds.has(quickViewProduct.id);

                      if (inCart) {
                        return (
                          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                            <button
                              type="button"
                              onClick={() => updateQuantity(quickViewProduct.id, modalSizeIdx, -1)}
                              aria-label={`Remove one ${quickViewProduct.name} from cart`}
                              className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <span className="font-bold text-sm w-6 text-center text-brand-green-dark">
                              {inCart.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(quickViewProduct.id, modalSizeIdx, 1)}
                              aria-label={`Add one more ${quickViewProduct.name}`}
                              className="w-8 h-8 rounded-lg bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          type="button"
                          onClick={() => handleAdd(quickViewProduct, modalSizeIdx)}
                          disabled={!quickViewProduct.inStock}
                          aria-label={`Add ${quickViewProduct.name} to cart`}
                          className={cn(
                            "flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-all duration-300 shadow-md",
                            justAdded
                              ? "bg-green-500 text-white scale-95"
                              : quickViewProduct.inStock
                                ? "bg-brand-green-dark text-white hover:bg-brand-green"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          {justAdded ? (
                            <>
                              <Check className="w-4 h-4" />
                              Added!
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );

  function handleAddOriginal(product: Product) {
    handleAddFromCard(product);
  }
}
