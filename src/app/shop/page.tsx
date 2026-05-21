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
import { Product, CartItem } from "@/lib/types";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details">("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [addedAnimation, setAddedAnimation] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const product = filtered[selectedIndex] || filtered[0];

  useEffect(() => {
    setSelectedIndex(0);
  }, [activeCategory]);

  const getSelectedSize = (productId: string) => selectedSizes[productId] ?? 0;

  const setSize = (productId: string, sizeIndex: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeIndex }));
  };

  const addToCart = (product: Product) => {
    const sizeIndex = getSelectedSize(product.id);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
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
  };

  const updateQuantity = (productId: string, sizeIndex: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId && item.sizeIndex === sizeIndex
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.sizes[item.sizeIndex].price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const deliveryFee = cartTotal >= 100 ? 0 : 10;
  const orderTotal = cartTotal + deliveryFee;

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
      `Please confirm availability and delivery time 🙏`,
    ];
    return lines.join("\n");
  };

  const sizeIdx = getSelectedSize(product.id);
  const currentPrice = product.sizes[sizeIdx].price;
  const inCart = cart.find(
    (item) => item.product.id === product.id && item.sizeIndex === sizeIdx
  );

  const goNext = () => setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
  const goPrev = () => setSelectedIndex((i) => Math.max(i - 1, 0));

  return (
    <>
      <Navbar cartCount={cartCount} />

      <main className="pt-24 pb-20 min-h-screen bg-gray-50/50">
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
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
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
              <div className="grid md:grid-cols-2 gap-6 items-center min-h-[520px]">
                {/* Left — Visual */}
                <div className="relative flex items-center justify-center p-10 md:p-14">
                  <div className="relative">
                    <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-black/5">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                        key={product.id}
                      />
                    </div>
                    {product.badge && (
                      <div className="absolute -top-1 -right-1 px-3 py-1 bg-brand-orange text-white text-[10px] font-bold tracking-wider uppercase rounded-full shadow-lg">
                        {product.badge}
                      </div>
                    )}
                    <div className="absolute inset-0 -m-5 rounded-full border border-dashed border-brand-green/10 animate-spin-slow" />
                  </div>

                  {/* Nav arrows — mobile */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between md:hidden">
                    <button onClick={goPrev} disabled={selectedIndex === 0} className="w-10 h-10 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-gray-400 self-center">
                      {selectedIndex + 1} / {filtered.length}
                    </span>
                    <button onClick={goNext} disabled={selectedIndex === filtered.length - 1} className="w-10 h-10 rounded-full bg-brand-green-dark text-white flex items-center justify-center disabled:opacity-30">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right — Info */}
                <div className="p-6 md:p-10 md:pr-12 space-y-5" key={product.id}>
                  <span className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-semibold uppercase tracking-widest rounded-full">
                    {product.category}
                  </span>

                  <h2 className="text-3xl sm:text-4xl font-bold text-brand-green-dark leading-tight">
                    {product.name}
                  </h2>

                  <p className="text-gray-500 leading-relaxed">
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
                          className="px-3 py-1.5 bg-white border border-gray-100 text-sm font-medium text-gray-700 rounded-xl shadow-sm"
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
                          className="px-3 py-1.5 bg-brand-gold/10 text-brand-gold text-sm font-semibold rounded-xl"
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
                            key={size.label}
                            onClick={() => setSize(product.id, idx)}
                            className={cn(
                              "px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200",
                              sizeIdx === idx
                                ? "bg-brand-green-dark text-white border-brand-green-dark shadow-md"
                                : "bg-white text-gray-600 border-gray-200 hover:border-brand-green/40"
                            )}
                          >
                            {size.label}
                            <span className="block text-[10px] font-normal mt-0.5 opacity-70">
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
                        <p className="text-xs text-gray-400">{product.sizes[sizeIdx].label}</p>
                      )}
                      <p className="text-3xl font-bold text-brand-green-dark">
                        {formatCurrency(currentPrice)}
                      </p>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, sizeIdx, -1)}
                          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg w-8 text-center text-brand-green-dark">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, sizeIdx, 1)}
                          className="w-10 h-10 rounded-xl bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3.5 font-bold rounded-xl transition-all duration-300 shadow-lg",
                          addedAnimation
                            ? "bg-green-500 text-white shadow-green-500/20 scale-95"
                            : "bg-brand-green-dark text-white shadow-brand-green/20 hover:bg-brand-green hover:scale-[1.02]"
                        )}
                      >
                        {addedAnimation ? (
                          <>
                            <Check className="w-5 h-5" />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-5 h-5" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
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
                  const itemInCart = cart.some((c) => c.product.id === p.id);
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
                        <Image src={p.image} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
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
                          {p.ingredients.slice(0, 3).join(" · ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-brand-green">
                          {formatCurrency(p.sizes[0].price)}
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
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
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
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-right">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                <p className="text-xs text-gray-400">{cartCount} item{cartCount > 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.sizeIndex}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {item.product.sizes[item.sizeIndex].label} · {formatCurrency(item.product.sizes[item.sizeIndex].price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQuantity(item.product.id, item.sizeIndex, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.sizeIndex, 1)} className="w-7 h-7 rounded-lg bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Delivery</span>
                <span className="text-sm font-semibold text-gray-700">{deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-brand-green-dark">{formatCurrency(orderTotal)}</span>
              </div>
              {cartTotal >= 100 && (
                <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                  🚚 You qualify for free delivery!
                </p>
              )}

              {checkoutStep === "cart" ? (
                <button
                  onClick={() => setCheckoutStep("details")}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-brand-green-dark text-white font-bold rounded-xl hover:bg-brand-green transition-all shadow-lg shadow-brand-green/20"
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
                    Send Order via WhatsApp
                  </a>
                  <button
                    onClick={() => setCheckoutStep("cart")}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <WhatsAppFloat />
      <Footer />
    </>
  );
}
