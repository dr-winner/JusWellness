"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green-dark transition-colors"
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
