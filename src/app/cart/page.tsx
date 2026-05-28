"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { cart, updateQuantity, clearCart, cartCount, cartTotal, deliveryFee, orderTotal } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const whatsappOrderMessage = () => {
    const items = cart
      .map(
        (item) =>
          `\u2022 ${item.product.name} (${item.product.sizes[item.sizeIndex].label}) x${item.quantity} \u2014 ${formatCurrency(item.product.sizes[item.sizeIndex].price * item.quantity)}`
      )
      .join("\n");
    const lines = [
      `\ud83e\uddc3 *NEW ORDER \u2014 Jus Wellness*`,
      ``,
      `*Customer:* ${customerName}`,
      `*Phone:* ${customerPhone}`,
      customerAddress ? `*Delivery:* ${customerAddress}` : `*Pickup:* East Legon`,
      ``,
      `*Items:*`,
      items,
      ``,
      `*Subtotal:* ${formatCurrency(cartTotal)}`,
      `*Delivery:* ${deliveryFee === 0 ? "FREE \ud83c\udf89" : formatCurrency(deliveryFee)}`,
      `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`,
      `*TOTAL: ${formatCurrency(orderTotal)}*`,
      ``,
      `Hi! I'd like to place this order. Please send me payment details \ud83d\ude4f`,
    ];
    return lines.join("\n");
  };

  if (cartCount === 0) {
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

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-brand-sand/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 pt-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-green-dark">Your Cart</h1>
              <p className="text-sm text-gray-500 mt-1">{cartCount} item{cartCount > 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Cart items */}
          <div className="space-y-3 mb-8">
            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.sizeIndex}`}
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
                  <p className="font-bold text-sm text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.product.sizes[item.sizeIndex].label} \u00b7 {formatCurrency(item.product.sizes[item.sizeIndex].price)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.sizeIndex, -1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.sizeIndex, 1)}
                    className="w-8 h-8 rounded-lg bg-brand-green text-white flex items-center justify-center hover:bg-brand-green-dark transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold text-brand-green-dark w-16 text-right">
                  {formatCurrency(item.product.sizes[item.sizeIndex].price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary & Checkout */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-lg font-bold">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="text-sm font-semibold text-gray-700">
                {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
              </span>
            </div>
            {cartTotal >= 100 && (
              <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                \ud83d\ude9a You qualify for free delivery!
              </p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-brand-green-dark">{formatCurrency(orderTotal)}</span>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ama Mensah"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0551234567"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery Address (optional)</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="East Legon, Boundary Rd"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                \ud83d\udcb3 After sending your order, we'll reply on WhatsApp with payment details (MoMo / bank transfer). Your order is confirmed once payment is received.
              </p>
              <a
                href={
                  customerName.trim() && customerPhone.trim()
                    ? `https://wa.me/233551792710?text=${encodeURIComponent(whatsappOrderMessage())}`
                    : "#"
                }
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
            </div>

            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm text-brand-green font-semibold hover:underline"
            >
              \u2190 Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
