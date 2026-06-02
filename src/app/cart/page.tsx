"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocationPicker, { type LocationData } from "@/components/LocationPicker";
import { useCart, getItemPrice, getItemTotal } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { logOrder } from "@/lib/sheets";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  X,
  RefreshCw,
  CalendarCheck,
  MapPin,
  Store,
  Truck,
  StickyNote,
} from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_NUMBER = "233551792710";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    toggleSubscription,
    clearCart,
    cartCount,
    cartTotal,
    orderTotal,
    subscriptionSavings,
    hasSubscriptions,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
  const [location, setLocation] = useState<LocationData>({ address: "" });
  const [deliveryNote, setDeliveryNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      newErrors.name = "Please enter your name";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name is too short";
    }
    const trimmedPhone = customerPhone.trim();
    if (!trimmedPhone) {
      newErrors.phone = "Please enter your phone number";
    } else if (!/^\+?233[0-9]{9}$|^0[0-9]{9}$/.test(trimmedPhone)) {
      newErrors.phone = "Enter a valid Ghana number (e.g. 0241234567)";
    }
    if (deliveryMode === "delivery" && !location.address.trim()) {
      newErrors.location = "Please enter your delivery location or use GPS";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [customerName, customerPhone, deliveryMode, location]);

  const buildWhatsAppMessage = useCallback((): string => {
    const oneTimeItems = cart.filter((i) => !i.subscription);
    const subItems = cart.filter((i) => i.subscription);

    const formatItem = (item: (typeof cart)[0]) => {
      const price = getItemPrice(item);
      const total = getItemTotal(item);
      const sub = item.subscription
        ? ` [${item.subscription === "weekly" ? "Weekly" : "Monthly"} Sub — 5% off]`
        : "";
      return `• ${item.product.name} (${item.product.sizes[item.sizeIndex].label}) x${item.quantity} — ${formatCurrency(total)}${sub}`;
    };

    const lines = [
      `🧃 *NEW ORDER — Jus Wellness*`,
      ``,
      `*Customer:* ${customerName.trim()}`,
      `*Phone:* ${customerPhone.trim()}`,
    ];

    if (deliveryMode === "delivery") {
      lines.push(`*🚚 Delivery To:* ${location.address.trim()}`);
      if (location.isLiveLocation && location.googleMapsUrl) {
        lines.push(`*📍 Live Location:* ${location.googleMapsUrl}`);
      }
    } else {
      lines.push(`*🏪 Pickup:* East Legon`);
    }

    if (deliveryNote.trim()) {
      lines.push(`*📝 Note:* ${deliveryNote.trim()}`);
    }

    lines.push(``);

    if (oneTimeItems.length > 0) {
      lines.push(`*One-Time Items:*`);
      oneTimeItems.forEach((item) => lines.push(formatItem(item)));
      lines.push(``);
    }

    if (subItems.length > 0) {
      lines.push(`🔄 *Subscription Items (5% discount):*`);
      subItems.forEach((item) => lines.push(formatItem(item)));
      lines.push(``);
    }

    lines.push(`━━━━━━━━━━━━━━`);
    lines.push(`*TOTAL: ${formatCurrency(orderTotal)}*`);

    if (subscriptionSavings > 0) {
      lines.push(
        `💰 *You save ${formatCurrency(subscriptionSavings)} with subscriptions!*`
      );
    }

    lines.push(``);
    lines.push(
      `Hi! I'd like to place this order. Please send me payment details 🙏`
    );

    return lines.join("\n");
  }, [
    cart,
    customerName,
    customerPhone,
    deliveryMode,
    location,
    deliveryNote,
    orderTotal,
    subscriptionSavings,
  ]);

  const handleCheckout = () => {
    if (!validate()) return;
    setShowConfirmation(true);
  };

  const confirmAndSend = () => {
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowConfirmation(false);
    setOrderSent(true);
    setTimeout(() => clearCart(), 500);

    // Fire-and-forget: log order to Google Sheet
    const locationStr = deliveryMode === "delivery"
      ? `${location.address.trim()}${location.googleMapsUrl ? ` (${location.googleMapsUrl})` : ""}`
      : "Pickup — East Legon";
    logOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: locationStr,
      deliveryNote: deliveryNote.trim(),
      items: cart.map((item) => ({
        name: item.product.name,
        size: item.product.sizes[item.sizeIndex].label,
        quantity: item.quantity,
        unitPrice: getItemPrice(item),
        lineTotal: getItemTotal(item),
        subscription: item.subscription,
      })),
      subtotal: cartTotal,
      subscriptionSavings,
      total: orderTotal,
    });
  };

  // ============================================================
  // EMPTY CART
  // ============================================================
  if (cartCount === 0 && !orderSent) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen bg-brand-sand/50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20 space-y-6">
              <div className="w-20 h-20 mx-auto bg-brand-cream rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Your cart is empty
              </h1>
              <p className="text-gray-500">
                Head to the shop to add some fresh juice to your cart!
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white font-bold rounded-full hover:bg-brand-gold transition-colors"
              >
                Browse Menu
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ============================================================
  // ORDER SENT
  // ============================================================
  if (orderSent) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen bg-brand-sand/50">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-6"
            >
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-brand-green-dark">
                Order Sent! 🎉
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
                Your order has been sent to our WhatsApp. We&apos;ll reply with
                payment details (MoMo or bank transfer) shortly.
              </p>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-3 text-left">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                  What happens next?
                </h3>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "We'll confirm your order on WhatsApp" },
                    { step: "2", text: "Send payment via MoMo or bank transfer" },
                    { step: "3", text: "We prepare your juice fresh that day" },
                    { step: "4", text: "Delivery or pickup — you choose!" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-brand-green text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <p className="text-sm text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/shop"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-dark transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back Home
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ============================================================
  // MAIN CART
  // ============================================================
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-brand-sand/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pt-4">
            <div className="flex items-center gap-4">
              <Link
                href="/shop"
                className="p-2 hover:bg-white rounded-xl transition-colors"
                aria-label="Back to shop"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-brand-green-dark">
                  Your Cart
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {cartCount} item{cartCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Cart items */}
          <div className="space-y-3 mb-8">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => {
                const effectivePrice = getItemPrice(item);
                const basePrice = item.product.sizes[item.sizeIndex].price;
                const isSub = !!item.subscription;

                return (
                  <motion.div
                    key={`${item.product.id}-${item.sizeIndex}-${item.subscription}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-16 h-16 bg-brand-cream rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.product.sizes[item.sizeIndex].label} ·{" "}
                          {isSub ? (
                            <>
                              <span className="line-through text-gray-300">
                                {formatCurrency(basePrice)}
                              </span>{" "}
                              <span className="text-green-600 font-semibold">
                                {formatCurrency(effectivePrice)}
                              </span>
                            </>
                          ) : (
                            `${formatCurrency(basePrice)} each`
                          )}
                        </p>
                        {isSub && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-brand-green/10 text-brand-green text-[10px] font-semibold rounded-full">
                            <RefreshCw className="w-2.5 h-2.5" />
                            {item.subscription === "weekly"
                              ? "Weekly"
                              : "Monthly"}{" "}
                            · 5% off
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.sizeIndex,
                              -1
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          aria-label={`Decrease ${item.product.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.sizeIndex,
                              1
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                          aria-label={`Increase ${item.product.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-brand-green-dark w-16 text-right">
                        {formatCurrency(getItemTotal(item))}
                      </p>
                    </div>

                    {/* Subscription toggle */}
                    <div className="px-4 pb-3 flex gap-2">
                      <button
                        onClick={() =>
                          toggleSubscription(
                            item.product.id,
                            item.sizeIndex,
                            "weekly"
                          )
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                          item.subscription === "weekly"
                            ? "bg-brand-green/10 border-brand-green text-brand-green"
                            : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                        }`}
                      >
                        <CalendarCheck className="w-3 h-3" />
                        Weekly
                      </button>
                      <button
                        onClick={() =>
                          toggleSubscription(
                            item.product.id,
                            item.sizeIndex,
                            "monthly"
                          )
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                          item.subscription === "monthly"
                            ? "bg-brand-green/10 border-brand-green text-brand-green"
                            : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                        }`}
                      >
                        <CalendarCheck className="w-3 h-3" />
                        Monthly
                      </button>
                      {isSub && (
                        <span className="ml-auto text-[10px] text-green-600 font-medium self-center">
                          Save {formatCurrency(basePrice * item.quantity * 0.05)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Subscription explainer banner */}
          {!hasSubscriptions && cart.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-brand-green/5 to-brand-gold/5 rounded-2xl border border-brand-green/10">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Subscribe & Save 5%
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Love a particular juice? Set it to weekly or monthly delivery
                    and save 5% on every order. Tap the subscription buttons on
                    any item above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary & Checkout */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-lg font-bold">
                {formatCurrency(cartTotal)}
              </span>
            </div>

            {subscriptionSavings > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-green-600 text-sm font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Subscription savings
                </span>
                <span className="text-sm font-bold text-green-600">
                  -{formatCurrency(subscriptionSavings)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-brand-green-dark">
                {formatCurrency(orderTotal)}
              </span>
            </div>

            {/* Customer Details */}
            <div className="border-t border-gray-100 pt-5 space-y-5">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                Your Details
              </h3>

              <div>
                <label
                  htmlFor="cart-name"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Your Name *
                </label>
                <input
                  id="cart-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="Ama Mensah"
                  maxLength={100}
                  autoComplete="name"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-brand-green/20 focus:border-brand-green"
                  } focus:ring-2 outline-none text-sm transition-all`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cart-phone"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Phone Number *
                </label>
                <input
                  id="cart-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  placeholder="0551234567"
                  maxLength={15}
                  autoComplete="tel"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.phone
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-200 focus:ring-brand-green/20 focus:border-brand-green"
                  } focus:ring-2 outline-none text-sm transition-all`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Delivery / Pickup toggle */}
              <div>
                <p className="block text-xs font-semibold text-gray-500 mb-2">
                  How do you want to get your juice? *
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode("delivery")}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                      deliveryMode === "delivery"
                        ? "border-brand-green bg-brand-green/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      deliveryMode === "delivery" ? "bg-brand-green/10" : "bg-gray-100"
                    }`}>
                      <Truck className={`w-4.5 h-4.5 ${
                        deliveryMode === "delivery" ? "text-brand-green" : "text-gray-400"
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${
                        deliveryMode === "delivery" ? "text-brand-green-dark" : "text-gray-700"
                      }`}>
                        Delivery
                      </p>
                      <p className="text-[10px] text-gray-400">We come to you</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMode("pickup");
                      if (errors.location) setErrors((p) => ({ ...p, location: "" }));
                    }}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                      deliveryMode === "pickup"
                        ? "border-brand-green bg-brand-green/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      deliveryMode === "pickup" ? "bg-brand-green/10" : "bg-gray-100"
                    }`}>
                      <Store className={`w-4.5 h-4.5 ${
                        deliveryMode === "pickup" ? "text-brand-green" : "text-gray-400"
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${
                        deliveryMode === "pickup" ? "text-brand-green-dark" : "text-gray-700"
                      }`}>
                        Pickup
                      </p>
                      <p className="text-[10px] text-gray-400">East Legon</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Location picker or Pickup info */}
              <AnimatePresence mode="wait">
                {deliveryMode === "delivery" ? (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Delivery Location *
                    </label>
                    <LocationPicker
                      value={location}
                      onChange={setLocation}
                      error={errors.location}
                      onClearError={() => setErrors((p) => ({ ...p, location: "" }))}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pickup"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 p-4 bg-brand-cream rounded-xl"
                  >
                    <Store className="w-5 h-5 text-brand-green shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Pickup Point</p>
                      <p className="text-xs text-gray-500">
                        East Legon, Accra — exact address sent on WhatsApp
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delivery note */}
              <div>
                <button
                  type="button"
                  onClick={() => setDeliveryNote((prev) => prev === "" ? " " : prev)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-1.5"
                >
                  <StickyNote className="w-3 h-3" />
                  Add a note to your order
                </button>
                <AnimatePresence>
                  {deliveryNote !== "" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <textarea
                        value={deliveryNote.trim() ? deliveryNote : ""}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        placeholder="E.g. Leave at the gate, call when arriving, specific landmark..."
                        maxLength={300}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm resize-none transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-start gap-3 p-4 bg-brand-cream rounded-xl">
                <ShieldCheck className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 leading-relaxed">
                  <p className="font-semibold text-gray-900 mb-1">
                    How payment works
                  </p>
                  After sending your order, we&apos;ll reply on WhatsApp with
                  payment details (MoMo or bank transfer). Your order is
                  confirmed once payment is received.
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                Place Order via WhatsApp
              </button>
            </div>

            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm text-brand-green font-semibold hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmation(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Confirm Your Order
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Review before sending to WhatsApp
              </p>

              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.sizeIndex}-${item.subscription}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="text-gray-700">
                        {item.product.name} (
                        {item.product.sizes[item.sizeIndex].label}) ×
                        {item.quantity}
                      </span>
                      {item.subscription && (
                        <span className="ml-1.5 text-[10px] text-brand-green font-semibold bg-brand-green/10 px-1.5 py-0.5 rounded">
                          {item.subscription === "weekly"
                            ? "Weekly"
                            : "Monthly"}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(getItemTotal(item))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 mb-5">
                {subscriptionSavings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Subscription savings</span>
                    <span className="font-medium">
                      -{formatCurrency(subscriptionSavings)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-brand-green-dark pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-lg">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1.5 text-sm">
                <p>
                  <span className="text-gray-500">Name:</span>{" "}
                  <strong>{customerName.trim()}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <strong>{customerPhone.trim()}</strong>
                </p>
                {deliveryMode === "delivery" ? (
                  <>
                    <p className="flex items-start gap-1">
                      <span className="text-gray-500 shrink-0">Delivery:</span>{" "}
                      <strong className="break-words">{location.address.trim()}</strong>
                    </p>
                    {location.isLiveLocation && (
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <MapPin className="w-3 h-3" />
                        Live location attached
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    <span className="text-gray-500">Pickup:</span>{" "}
                    <strong>East Legon</strong>
                  </p>
                )}
                {deliveryNote.trim() && (
                  <p>
                    <span className="text-gray-500">Note:</span>{" "}
                    <em>{deliveryNote.trim()}</em>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={confirmAndSend}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
