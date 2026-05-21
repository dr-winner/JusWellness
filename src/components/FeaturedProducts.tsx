"use client";

import { useState } from "react";
import Image from "next/image";
import { products } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const featured = products.filter((p) => p.badge).slice(0, 8);

const categoryEmoji: Record<string, string> = {
  juice: "🧃",
  coconut: "🥥",
  mashke: "🥤",
  shot: "⚡",
};

const bgGradients: Record<string, string> = {
  juice: "from-green-50 via-brand-cream/50 to-white",
  coconut: "from-amber-50 via-orange-50/30 to-white",
  mashke: "from-purple-50 via-pink-50/30 to-white",
  shot: "from-yellow-50 via-brand-cream/50 to-white",
};

export default function FeaturedProducts() {
  const [current, setCurrent] = useState(0);
  const product = featured[current];

  const next = () => setCurrent((prev) => (prev + 1) % featured.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + featured.length) % featured.length);

  return (
    <section id="products" className="relative py-24 sm:py-32 bg-white overflow-hidden">
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
            View all 23 products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Spotlight product */}
        <div
          className={cn(
            "relative rounded-[2.5rem] overflow-hidden transition-all duration-700 bg-gradient-to-br",
            bgGradients[product.category]
          )}
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[480px]">
            {/* Left — Visual */}
            <div className="relative flex items-center justify-center p-12 lg:p-16">
              {/* Large emoji / product visual */}
              <div className="relative">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-sm shadow-2xl shadow-brand-green/5">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-all duration-500"
                    key={product.id}
                  />
                </div>

                {/* Floating badge */}
                {product.badge && (
                  <div className="absolute -top-2 -right-2 px-4 py-1.5 bg-brand-green-dark text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-lg">
                    {product.badge}
                  </div>
                )}

                {/* Decorative ring */}
                <div className="absolute inset-0 -m-6 rounded-full border-2 border-dashed border-brand-green/10 animate-spin-slow" />
              </div>
            </div>

            {/* Right — Info */}
            <div className="p-8 lg:p-16 lg:pr-20 space-y-6" key={product.id}>
              {/* Category */}
              <span className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-xs font-semibold uppercase tracking-wider rounded-full">
                {product.category}
              </span>

              {/* Name */}
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-green-dark leading-tight">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                {product.description}
              </p>

              {/* Ingredients */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Ingredients
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-3.5 py-1.5 bg-white border border-gray-100 text-sm font-medium text-gray-700 rounded-xl shadow-sm"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Benefits
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.benefits.map((b) => (
                    <span
                      key={b}
                      className="px-3.5 py-1.5 bg-brand-gold/10 text-brand-gold text-sm font-semibold rounded-xl"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-brand-green-dark">
                    {formatCurrency(product.sizes[0].price)}
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-brand-green-dark text-white font-bold rounded-xl hover:bg-brand-green transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-brand-green/20"
                >
                  Order Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="absolute bottom-6 left-8 lg:left-auto lg:bottom-8 lg:right-8 flex items-center gap-3">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
              aria-label="Previous product"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>
            <span className="text-sm font-semibold text-gray-400 min-w-[3rem] text-center">
              {current + 1}/{featured.length}
            </span>
            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-brand-green-dark text-white flex items-center justify-center hover:bg-brand-green hover:shadow-md transition-all"
              aria-label="Next product"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product thumbnails / quick nav */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {featured.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300",
                current === i
                  ? "bg-brand-green-dark text-white border-brand-green-dark shadow-lg shadow-brand-green/15"
                  : "bg-white text-gray-600 border-gray-100 hover:border-brand-green/30 hover:bg-gray-50"
              )}
            >
              <span className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                <Image src={p.image} alt={p.name} width={28} height={28} className="w-full h-full object-cover" />
              </span>
              <span className="text-sm font-semibold whitespace-nowrap">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
