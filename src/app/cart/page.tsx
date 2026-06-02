"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
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
  Truck,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_NUMBER = "233551792710";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    deliveryFee,
    orderTotal,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // Validate form fields
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [customerName, customerPhone]);

  // Build WhatsApp order message
  const buildWhatsAppMessage = useCallback((): string => {
    const items = cart
      .map(
        (item) =>
          `• ${item.product.name} (${item.product.sizes[item.sizeIndex].label}) x${item.quantity} — ${formatCurrency(item.product.sizes[item.sizeIndex].price * item.quantity)}`
      )
      .join("\n");

    const lines = [
      `🧃 *NEW ORDER — Jus Wellness*`,
      ``,
      `*Customer:* ${customerName.trim()}`,
      `*Phone:* ${customerPhone.trim()}`,
      customerAddress.trim()
        ? `*Delivery:* ${customerAddress.trim()}`
        : `*Pickup:* East Legon`,
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
  }, [cart, customerName, customerPhone, customerAddress, cartTotal, deliveryFee, orderTotal]);

  // Handle checkout click — show confirmation first
  const handleCheckout = () => {
    if (!validate()) return;
    setShowConfirmation(true);
  };

  // Confirm and send to WhatsApp
  const confirmAndSend = () => {
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(url, "_blank", "noopener,noreferrer");

    // Show success state
    setShowConfirmation(false);
    setOrderSent(true);

    // Clear cart after a brief delay (let user see success first)
    setTimeout(() => {
      clearCart();
    }, 500);
  };

  // ============================================================
  // EMPTY CART STATE
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
  // ORDER SENT SUCCESS STATE
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
                payment details (MoMo or bank transfer) shortly. Your order is
                confirmed once payment is received.
              </p>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-3 text-left">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                  What happens next?
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      step: "1",
                      text: "We'll confirm your order on WhatsApp",
                    },
                    {
                      step: "2",
                      text: "Send payment via MoMo or bank transfer",
                    },
                    {
                      step: "3",
                      text: "We prepare your juice fresh that day",
                    },
                    {
                      step: "4",
                      text: "Delivery or pickup — you choose!",
                    },
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
  // MAIN CART VIEW
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
              {cart.map((item) => (
                <motion.div
                  key={`${item.product.id}-${item.sizeIndex}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100"
                >
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
                      {formatCurrency(item.product.sizes[item.sizeIndex].price)}{" "}
                      each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.sizeIndex, -1)
                      }
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      aria-label={`Decrease quantity of ${item.product.name}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.sizeIndex, 1)
                      }
                      className="w-8 h-8 rounded-lg bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-brand-green-dark w-16 text-right">
                    {formatCurrency(
                      item.product.sizes[item.sizeIndex].price * item.quantity
                    )}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary & Checkout */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5">
            {/* Totals */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-lg font-bold">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="text-sm font-semibold text-gray-700">
                {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
              </span>
            </div>
            {cartTotal >= 100 && (
              <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                You qualify for free delivery!
              </p>
            )}
            {cartTotal > 0 && cartTotal < 100 && (
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                🚚 Add{" "}
                <strong>{formatCurrency(100 - cartTotal)}</strong> more for
                free delivery
              </p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-brand-green-dark">
                {formatCurrency(orderTotal)}
              </span>
            </div>

            {/* Customer Details */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
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
                    if (errors.name)
                      setErrors((p) => ({ ...p, name: "" }));
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
                    if (errors.phone)
                      setErrors((p) => ({ ...p, phone: "" }));
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

              <div>
                <label
                  htmlFor="cart-address"
                  className="block text-xs font-semibold text-gray-500 mb-1"
                >
                  Delivery Address{" "}
                  <span className="text-gray-400 font-normal">
                    (optional — leave blank for pickup)
                  </span>
                </label>
                <input
                  id="cart-address"
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="East Legon, Boundary Rd"
                  maxLength={200}
                  autoComplete="street-address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm transition-all"
                />
              </div>

              {/* Payment info */}
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

              {/* Checkout button */}
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
      {/* ORDER CONFIRMATION MODAL */}
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
                aria-label="Close confirmation"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Confirm Your Order
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Review before sending to WhatsApp
              </p>

              {/* Order summary */}
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.sizeIndex}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {item.product.name} ({item.product.sizes[item.sizeIndex].label}) ×{item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        item.product.sizes[item.sizeIndex].price *
                          item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 mb-5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span>
                    {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-brand-green-dark pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-lg">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
              </div>

              {/* Customer info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Name:</span>{" "}
                  <strong>{customerName.trim()}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <strong>{customerPhone.trim()}</strong>
                </p>
                {customerAddress.trim() && (
                  <p>
                    <span className="text-gray-500">Delivery:</span>{" "}
                    <strong>{customerAddress.trim()}</strong>
                  </p>
                )}
                {!customerAddress.trim() && (
                  <p>
                    <span className="text-gray-500">Pickup:</span>{" "}
                    <strong>East Legon</strong>
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
