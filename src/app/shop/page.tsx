"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { products, categories } from "@/lib/products";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  MessageCircle,
  ArrowRight,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";

const categoryEmoji: Record<string, string> = {
  juice: "🧃",
  coconut: "🥥",
  mashke: "🥤",
  shot: "⚡",
};

const bgAccents: Record<string, string> = {
  juice: "from-green-50/80 to-brand-cream/30",
  coconut: "from-amber-50/80 to-orange-50/20",
  mashke: "from-purple-50/80 to-pink-50/20",
  shot: "from-yellow-50/80 to-orange-50/20",
};

export default function ShopPage() {
  const { cart, addToCart: ctxAddToCart, updateQuantity, cartCount: ctxCartCount, cartTotal, deliveryFee, orderTotal, hydrated } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details">("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const cartCount = hydrated ? ctxCartCount : 0;

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const product = filtered[selectedIndex] || filtered[0];

  useEffect(() => {
    if (!cartOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cartOpen]);

  const getSelectedSize = (productId: string) => selectedSizes[productId] ?? 0;

  const setSize = (productId: string, sizeIndex: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeIndex }));
  };

  const addToCart = (product: Product) => {
    const sizeIndex = getSelectedSize(product.id);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1200);
    ctxAddToCart(product, sizeIndex);
  };

  const whatsappOrderMessage = () => {
    const items = cart
      .map(
        (item) =>
          `• ${item.product.name} (${item.product.sizes[item.sizeIndex].label}) x${item.quantity} — ${formatCurrency(item.product.sizes[item.sizeIndex].price * item.quantity)}`
      )
      .join("\n");
    const lines = [
      `🧃 *NEW ORDER — Jus Wellness*`,
      ``,
      `*Customer:* ${customerName}`,
      `*Phone:* ${customerPhone}`,
      customerAddress ? `*Delivery:* ${customerAddress}` : `*Pickup:* East Legon`,
      ``,
      `*Items:*`,
      items,
      ``,
      `*Subtotal:* ${formatCurrency(cartTotal)}`,
      `*Delivery:* ${deliveryFee === 0 ? "FREE 🎉" : formatCurrency(deliveryFee)}`,
      `━━━━━━━━━━━━━━`,
      `*TOTAL: ${formatCurrency(orderTotal)}*`,
      ``,
      `Hi! I'd like to place this order. Please send me payment details 🙏`,
    ];
    return lines.join("\n");
  };

  const sizeIdx = getSelectedSize(product.id);
  const currentPrice = product.sizes[sizeIdx].price;
  const addedAnimation = addedProductId === product.id;
  const inCart = cart.find(
    (item) => item.product.id === product.id && item.sizeIndex === sizeIdx
  );

  const goNext = () => setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
  const goPrev = () => setSelectedIndex((i) => Math.max(i - 1, 0));

  return (
    <>
      <Navbar cartCount={cartCount} />

      <main className="pt-24 pb-20 min-h-screen bg-brand-sand/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-8 pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-brand-green" />
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-green">
                {filtered.length} Products · Made Fresh Daily
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-green-dark">
              Our Menu
            </h1>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedIndex(0);
                }}
                aria-pressed={activeCategory === cat.id}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                  activeCategory === cat.id
                    ? "bg-brand-green-dark text-white shadow-lg shadow-brand-green/20"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                )}
              >
                <span>{categoryEmoji[cat.id] || "✨"}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Main layout: Spotlight + List */}
          <div className="grid lg:grid-cols-[1fr,320px] gap-6">
            {/* Spotlight product */}
            <div
              className={cn(
                "relative rounded-3xl overflow-hidden bg-gradient-to-br transition-all duration-500",
                bgAccents[product.category]
              )}
            >
              <div className="grid md:grid-cols-2 gap-6 items-center min-h-[580px]">
                {/* Left — Visual */}
                <div className="relative flex items-center justify-center p-10 md:p-14">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-black/5">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          height={400}
                          sizes="(min-width: 768px) 320px, 288px"
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      {product.badge && (
                        <div className="absolute -top-1 -right-1 px-3 py-1 bg-brand-orange text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-lg">
                          {product.badge}
                        </div>
                      )}
                      <div className="absolute inset-0 -m-5 rounded-full border border-dashed border-brand-green/10 animate-spin-slow pointer-events-none" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Nav arrows — mobile */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between md:hidden">
                    <button type="button" onClick={goPrev} disabled={selectedIndex === 0} aria-label="Previous product" className="w-10 h-10 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-gray-400 self-center">
                      {selectedIndex + 1} / {filtered.length}
                    </span>
                    <button type="button" onClick={goNext} disabled={selectedIndex === filtered.length - 1} aria-label="Next product" className="w-10 h-10 rounded-full bg-brand-green-dark text-white flex items-center justify-center disabled:opacity-30">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right — Info */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-10 md:pr-12 space-y-5"
                  >
                    <span className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-semibold uppercase tracking-widest rounded-full">
                      {product.category}
                    </span>

                    <h2 className="text-3xl sm:text-4xl font-bold text-brand-green-dark leading-tight">
                      {product.name}
                    </h2>

                    <p className="text-gray-500 leading-relaxed text-sm">
                      {product.description}
                    </p>

                    {/* Ingredients */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Ingredients
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="px-3 py-1.5 bg-white border border-gray-100 text-xs font-semibold text-gray-700 rounded-xl shadow-sm"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                        Benefits
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.benefits.map((b) => (
                          <span
                            key={b}
                            className="px-3 py-1.5 bg-brand-gold/10 text-brand-gold text-xs font-bold rounded-xl"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Size selector */}
                    {product.sizes.length > 1 && (
                      <div className="space-y-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                          Size
                        </p>
                        <div className="flex gap-2">
                          {product.sizes.map((size, idx) => (
                            <button
                              type="button"
                              key={size.label}
                              onClick={() => setSize(product.id, idx)}
                              aria-pressed={sizeIdx === idx}
                              className={cn(
                                "px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200",
                                sizeIdx === idx
                                  ? "bg-brand-green-dark text-white border-brand-green-dark shadow-md"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-green/40"
                              )}
                            >
                              {size.label}
                              <span className="block text-[9px] font-normal mt-0.5 opacity-70">
                                {formatCurrency(size.price)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price & Add to Cart */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <div className="flex-1">
                        {product.sizes.length > 1 && (
                          <p className="text-[10px] text-gray-400">{product.sizes[sizeIdx].label}</p>
                        )}
                        <p className="text-2xl font-black text-brand-green-dark">
                          {formatCurrency(currentPrice)}
                        </p>
                      </div>

                      {hydrated && inCart ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, sizeIdx, -1)}
                            aria-label={`Remove one ${product.name} from cart`}
                            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-base w-6 text-center text-brand-green-dark">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, sizeIdx, 1)}
                            aria-label={`Add one more ${product.name}`}
                            className="w-10 h-10 rounded-xl bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          aria-label={`Add ${product.name} ${product.sizes[sizeIdx].label} to cart`}
                          className={cn(
                            "flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 shadow-lg",
                            addedAnimation
                              ? "bg-green-500 text-white shadow-green-500/20 scale-95"
                              : product.inStock
                                ? "bg-brand-green-dark text-white shadow-brand-green/20 hover:bg-brand-green hover:scale-[1.02]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          {addedAnimation ? (
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
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Product list sidebar */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <p className="text-sm font-bold text-gray-900">
                  All {filtered.length} Products
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tap to spotlight
                </p>
              </div>
              <div ref={listRef} className="flex-1 overflow-y-auto">
                {filtered.map((p, i) => {
                  const itemInCart = hydrated && cart.some((c) => c.product.id === p.id);
                  const pSizeIdx = getSelectedSize(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedIndex(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-200 border-b border-gray-50",
                        selectedIndex === i
                          ? "bg-brand-green-dark/5 border-l-[3px] border-l-brand-green"
                          : "hover:bg-gray-50 border-l-[3px] border-l-transparent"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <Image src={p.image} alt={p.name} width={40} height={40} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-semibold truncate",
                            selectedIndex === i ? "text-brand-green-dark" : "text-gray-800"
                          )}
                        >
                          {p.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {p.sizes.length > 1
                            ? p.sizes.map((s) => s.label).join(" · ")
                            : p.ingredients.slice(0, 3).join(" · ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-brand-green">
                          {formatCurrency(p.sizes[pSizeIdx].price)}
                        </p>
                        {itemInCart && (
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            IN CART
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating cart button */}
      {hydrated && cartCount > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}, ${formatCurrency(cartTotal)}`}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-6 py-4 bg-brand-green-dark text-white font-bold rounded-2xl shadow-2xl shadow-black/20 hover:bg-brand-green hover:scale-[1.03] transition-all duration-300"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-orange text-[9px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <span>{formatCurrency(cartTotal)}</span>
        </button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-drawer-title"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 id="cart-drawer-title" className="text-lg font-bold text-gray-900">Your Cart</h2>
                  <p className="text-xs text-gray-400">{cartCount} item{cartCount > 1 ? "s" : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  aria-label="Close cart"
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {hydrated && cart.map((item) => (
                  <div key={`${item.product.id}-${item.sizeIndex}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="w-full h-full object-contain p-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {item.product.sizes[item.sizeIndex].label} · {formatCurrency(item.product.sizes[item.sizeIndex].price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => updateQuantity(item.product.id, item.sizeIndex, -1)} aria-label={`Remove one ${item.product.name}`} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.product.id, item.sizeIndex, 1)} aria-label={`Add one more ${item.product.name}`} className="w-7 h-7 rounded-lg bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(hydrated ? cartTotal : 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Delivery</span>
                  <span className="text-sm font-semibold text-gray-700">{hydrated && deliveryFee === 0 ? "FREE" : formatCurrency(hydrated ? deliveryFee : 0)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-brand-green-dark">{formatCurrency(hydrated ? orderTotal : 0)}</span>
                </div>
                {hydrated && cartTotal >= 100 && (
                  <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                    🚚 You qualify for free delivery!
                  </p>
                )}

                {checkoutStep === "cart" ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("details")}
                    disabled={cartCount === 0}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-brand-green-dark text-white font-bold rounded-xl hover:bg-brand-green transition-all shadow-lg shadow-brand-green/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Your Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ama Mensah"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0551234567"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery Address (optional)</label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="East Legon, Boundary Rd"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 bg-gray-50 px-3 py-2.5 rounded-xl leading-relaxed">
                      💸 After sending your order, we will reply on WhatsApp with payment details (MoMo / bank transfer). Your order is confirmed once payment is received.
                    </p>
                    <a
                      href={customerName.trim() && customerPhone.trim() ? `https://wa.me/233551792710?text=${encodeURIComponent(whatsappOrderMessage())}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!customerName.trim() || !customerPhone.trim()) {
                          e.preventDefault();
                          alert("Please enter your name and phone number.");
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Place Order via WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("cart")}
                      className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      ← Back to cart
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WhatsAppFloat />
      <Footer />
    </>
  );
}
